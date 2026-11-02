# Testing the support person back end locally

Use a **local** Supabase. Until the PR merges, the new migrations are not on the shared dev project, and pushing
them there early would block everyone's `db push`. The support person app needs a real sign-in, so
`npx expo start` on its own is not enough.

## 1. Start the local stack (needs Docker)

```bash
git fetch && git checkout feature/support-person-backend
npm install
supabase start      # applies every migration, including the five new ones
supabase status     # copy the API URL and the publishable (anon) key
```

## 2. Point the app at it

In `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=http://<your-computer's-LAN-IP>:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<key from supabase status>
EXPO_PUBLIC_BYPASS_AUTH=false
```

- On a phone, use your computer's LAN IP (`ipconfig getifaddr en0` on a Mac), not `127.0.0.1`.
- `EXPO_PUBLIC_BYPASS_AUTH` must be `false`.

Then run `npx expo start -c`.

## 3. Test accounts

| Account | Number | Code |
| --- | --- | --- |
| Patient | `0491 570 006` | `123456` |
| Support person | `0491 570 007` | `123456` |

No SMS is sent: both numbers are test numbers in `supabase/config.toml` (`[auth.sms.test_otp]`).

## 4. Make the patient

1. Signed out, tap **Get started** and choose **I am a Patient**.
2. Enter a name, accept consent, then answer the sex, year of birth and conditions screens (any answers).
3. Continue, enter `0491 570 006` and code `123456`. The profile is created here.
4. Under **Health**, complete all five assessments: pain, movement, personal care, social health and
   management. Without all five, no questions are suggested (decision M3).
5. **Settings → Support persons:** add `0491 570 007` with **Add questions** on. It shows **Pending**.
6. **Care Planner:** add an appointment. On the Support person step pick that person, tick some questions,
   then tap **Save** on Review. A draft appointment is not shown to support persons.

## 5. Make the support person

1. Sign out. Tap **Get started**, choose **I am a Support Person**, enter a name and accept consent.
2. Enter `0491 570 007` and code `123456`.
3. Open **Requests**. It shows the patient's name only, with no conditions. Tap **Accept**.
4. The patient and that appointment appear.

Switch accounts by signing out and in, or use two devices/simulators with the same `.env`.

## 6. What to check

| Do | Expect |
| --- | --- |
| Support person: **Add questions**, tick or untick, Save | Saves; the patient sees the change |
| Support person: look for an answer pen | None (no answers permission) |
| Patient: turn on **Add doctor's answer** for them | Still no pen; the plan says "{name} needs to record the doctor's consent first." |
| Patient: record consent on the plan | The support person can now add answers |
| Support person: untick a question that has an answer, without the answers permission | Blocked with a message |
| Patient: take them off the appointment, or turn a permission off | Takes effect at once for the support person |
| Support person: **Unpair** (Settings → People you support) | The patient disappears; the patient's list shows **Declined** |
| Patient: invite again; support person taps **Reject** | The request goes away and nothing is shared |
| A third number (not invited) | Sees no requests and no patients |

Full checklist: step T7 in `support-person-backend-build-plan.md`.

## If something goes wrong

| Symptom | Fix |
| --- | --- |
| "Code is wrong or expired" | `supabase stop && supabase start`, so the test numbers in `config.toml` are loaded |
| Error when sending the code (for example "unsupported phone provider") | In your local `config.toml` only, set `[auth.sms.twilio] enabled = true` with dummy `account_sid` and `message_service_sid`, restart, and **don't commit it**. Tell Ryan so it can be fixed for everyone |
| "Too many requests" | Wait about 2 minutes |
| Works on a simulator but not a phone | Use the LAN IP in `EXPO_PUBLIC_SUPABASE_URL` |
| Support person sees no appointment | The patient didn't add them to it on the Support person step, or didn't Save on Review |
| No questions to tick | The patient hasn't completed all five assessments |

## Clean up

`supabase stop`, then point `.env` back at the dev project.
