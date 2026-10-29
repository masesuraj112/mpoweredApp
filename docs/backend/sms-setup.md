# SMS setup (Twilio through Supabase Auth)

How real SMS login codes are set up. This file holds variable names, dashboard steps and findings only. **No values**: never write an Account SID, Auth Token, Messaging Service SID or phone number here. Progress and decisions: `sms-progress.md`. Background: `twilio-otp-integration-guide.md`.

## What runs where

| Piece | Where it lives | Notes |
| --- | --- | --- |
| Sending a code | App calls `signInWithOtp` (`src/services/auth.ts`); Supabase Auth sends the SMS | No Twilio code or secret in the app, EAS or GitHub |
| Twilio credentials | Supabase dashboard only | Three fields, below |
| Developer logins | Supabase test OTP entries | Skip Twilio entirely, so no SMS and no cost |
| Local and CI | `supabase/config.toml` | `[auth.sms.twilio] enabled = false`, token as `env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)` only |

The guard test `__tests__/unit/sms-config-guard.test.ts` fails if either test number is removed, the local Twilio provider is turned on, or a Twilio-style secret is committed.

## Dashboard fields (Supabase, Authentication, Sign In / Providers, Phone)

Provider: **Twilio** (not Twilio Verify). Copy each value from the Twilio Console straight into the field. Do not paste them into chat, files or the repo.

| Supabase field | Where to copy it from in Twilio |
| --- | --- |
| Twilio Account SID (starts `AC`) | Console home, Account Info |
| Twilio Auth Token | Console home, Account Info, Show |
| Twilio Message Service SID (starts `MG`) | Messaging, Services, the service, Service SID |

If the Auth Token is rotated in Twilio, enter the new one in Supabase or sending stops.

## Settings on the dev project

| Setting | Value | Why |
| --- | --- | --- |
| SMS OTP length | 6 | Matches `OTP_LENGTH` |
| SMS OTP expiry | 120 s | Decision D2 |
| Message template | `MPowered: your code is {{ .Code }}. Do not share it.` | Plain characters keep it to one segment |
| SMS sent per hour | 20 | Project-wide cap; limits the cost of abuse |
| Minimum interval between OTP requests | 60 s | Locked on the dev plan unless custom SMTP is set; matches `RESEND_SECONDS` |
| Twilio geo permissions | Australia only | Twilio also enabled Cocos and Christmas Island by default (same +61 code) |

The app's verify screen starts a 60 s countdown on arrival, hides Resend until it ends, and says the text can take up to 30 seconds.

## Twilio account (dev)

- A personal trial account named `mpowered-test` (decision D4), for plumbing only. No real patient sign-ins, no alphanumeric sender registration, no Australian number purchase.
- Trial: texts go only to numbers verified in the console, and every message is prefixed `Sent from your Twilio trial account - `. Upgrading was skipped because it asks for personal ID and tax details.
- Sender: a US number bought with trial credit (no address requirement), added to the Messaging Service. It is a stand-in; MHA's account will use an Australian number or a registered sender name.

## Findings from the dev test

- A real code reached an Australian mobile from the US trial number in about 20 seconds, and sign-in worked.
- The text matched the template, with the trial prefix. No pre-defined-template restriction showed up.
- Price in the Twilio message details: US$0.0515, one segment.
- Developer login `0491 570 006` signs in with no Twilio message.
- The hosted dev project has the `006` test number and one extra entry that is not in the repo; `007` is local and CI only. None may exist on production.
- Not checked: code autofill on the phone, wrong code three times, early resend forced past the UI, waiting past 120 s, a non-Australian number being blocked by geo permissions.

## Moving to MHA and production

1. MHA creates their own Twilio account (an email they control), a Messaging Service and an Australian sender (a number, or a sender name registered under their ABN).
2. Create a separate Supabase production project and apply all migrations (see `production-auth-checklist.md`).
3. In its Phone provider, enter **MHA's** three values, the same OTP settings, **no test numbers**, and a rate limit chosen for real traffic.
4. Point only the EAS `production` environment at it. Test with a real number that is not a developer's and check the Twilio logs and cost.

No code change is needed, because the app never holds Twilio values. The personal `mpowered-test` account can then be closed.

## Never

- Run `supabase config push`, `db reset` or `db push` against production.
- Add a phone or code bypass to app code, or new `EXPO_PUBLIC_*` variables for Twilio.
- Commit Twilio credentials, or log phone numbers or codes.
- Use Twilio Verify (test OTP behaviour with it is unconfirmed).
