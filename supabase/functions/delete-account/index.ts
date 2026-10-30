// Deletes the signed-in user's account (Settings > Privacy/Data and Legal > Account deletion).
// docs/settings-backend.md, step 9.
//
// 1. withSupabase checks the caller's sign-in token (verify_jwt is off in config.toml; this
//    replaces it) and answers CORS preflight requests.
// 2. The SMS code the app sent is checked against the account's OWN phone number, read from Auth,
//    never from the request. The request carries only { code }.
// 3. delete_account removes their data in one transaction (service role only).
// 4. The login is deleted last, because public.users.auth_id points at it.
//
// Responses: 200 { ok: true }, or { error: CODE } with CODE one of INVALID_OTP, OTP_EXPIRED,
// NOT_ALLOWED, NO_PHONE, NO_PROFILE, UNKNOWN. Codes match AppErrorCode in src/lib/errors.ts.

import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { createClient } from "@supabase/supabase-js";

const reply = (status: number, body: Record<string, unknown>) => Response.json(body, { status });

/** The publishable key: the new JSON variable first, then the legacy anon key. */
function publishableKey(): string {
  const keys = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (keys) return JSON.parse(keys)["default"];
  return Deno.env.get("SUPABASE_ANON_KEY") ?? "";
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    if (req.method !== "POST") return reply(405, { error: "NOT_ALLOWED" });
    const userId = ctx.userClaims?.id;
    if (!userId) return reply(401, { error: "NOT_ALLOWED" });

    let code: unknown;
    try {
      ({ code } = await req.json());
    } catch {
      return reply(400, { error: "INVALID_OTP" });
    }
    if (typeof code !== "string" || !/^\d{6}$/.test(code)) return reply(400, { error: "INVALID_OTP" });

    // The phone comes from Auth, so a caller can only ever prove they hold their own number.
    const { data: authUser, error: authUserError } = await ctx.supabaseAdmin.auth.admin.getUserById(userId);
    if (authUserError || !authUser?.user) return reply(500, { error: "UNKNOWN" });
    const storedPhone = authUser.user.phone;
    if (!storedPhone) return reply(409, { error: "NO_PHONE" });
    const phone = storedPhone.startsWith("+") ? storedPhone : `+${storedPhone}`;

    // A separate client that keeps no session: the new session from verifyOtp is thrown away.
    const otpClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", publishableKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: verified, error: verifyError } = await otpClient.auth.verifyOtp({
      phone,
      token: code,
      type: "sms",
    });
    if (verifyError) return reply(401, { error: "OTP_EXPIRED" });
    if (verified.user?.id !== userId) return reply(403, { error: "NOT_ALLOWED" });

    // Their own users row, read as them (RLS-scoped client; always filter users by auth_id).
    const { data: profile, error: profileError } = await ctx.supabase
      .from("users")
      .select("users_id")
      .eq("auth_id", userId)
      .maybeSingle();
    if (profileError) return reply(500, { error: "UNKNOWN" });
    if (!profile) return reply(404, { error: "NO_PROFILE" });

    const { error: deleteError } = await ctx.supabaseAdmin.rpc("delete_account", {
      p_users_id: profile.users_id,
    });
    if (deleteError) {
      console.error("delete_account failed", deleteError.code);
      return reply(500, { error: "UNKNOWN" });
    }

    const { error: authDeleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      // The data is already gone; signing in again starts onboarding as a new user.
      console.error("auth deleteUser failed after delete_account", authDeleteError.status);
      return reply(500, { error: "UNKNOWN" });
    }

    return reply(200, { ok: true });
  }),
};
