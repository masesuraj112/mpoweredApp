# Notifications — Build Plan

> **Scope: patient reminders** for assessments and appointments (US15), controlled by the toggles in Settings >
> Notifications (US22). The Settings branch (`settings-backend.md`, PR #52) already stores the choices in
> `user_settings`; nothing sends them yet. This branch makes them arrive.
> **Branch:** `feature/notifications`, from `main` after the support person back end merged. Owner: Ryan Pham.
> Mirrors the earlier plans: guardrails, decisions register, phases, one commit per step, tests with each step.
> **No database changes.** Reminders are scheduled on the phone, so there is no migration, pgTAP test or
> Edge Function, and CI's `database-tests` job should not change.

---

## 0. What exists today

| Piece | Where | State |
| --- | --- | --- |
| Notification choices | `user_settings` (`20261029114645_settings_user_settings`) | Stored per user: `assessment_reminders`, `assessment_every` (1–7), `assessment_unit` (`days`/`weeks`), `appointment_reminders`, `appointment_day_before`, `appointment_on_day` |
| Settings service | `src/services/settings.ts` | `getNotificationSettings()` (defaults when there's no row), `saveNotificationSettings()` |
| Settings hook | `src/features/settings/useNotificationSettings.ts` | Optimistic update with rollback |
| Screen | `app/(tabs)/settings/notifications.tsx` | Two toggles and two popups; saves, sends nothing |
| Appointments | `listAppointments()` in `src/services/care-planner.ts` | `dateTime` is local wall-clock time; `status` is `draft` or `saved` |
| Assessments | `getAssessments()` in `src/services/health.ts` | Latest entry of each of the five kinds, each with a `date` |
| `expo-notifications` | — | **Not installed** |
| Support persons | `app/(support)/support-settings/index.tsx` | No Notifications page (Figma 3896-21559). The bell on their Care Planner is an in-app count, not a notification |

### 0.1 Checked in the SDK 58 docs (N0/N1, 2 Nov 2026)

| Question | Answer |
| --- | --- |
| Local notifications in Expo Go? | Yes: "Local notifications (in-app notifications) remain available in Expo Go." Only remote push is missing on Android |
| Package | `expo-notifications` `~58.1.7` (`npx expo install expo-notifications`) |
| Trigger for one reminder | `{ type: SchedulableTriggerInputTypes.DATE, date, channelId? }`; `delivery` defaults to `'bestEffort'` |
| Other triggers | `CALENDAR`, `DAILY`, `MONTHLY`, `TIME_INTERVAL`, `WEEKLY` (weekday 1 = Sunday), `YEARLY`. Not used: the planner works out every date itself |
| Android channels | Required from Android 8; without one a "Miscellaneous" channel is made. **The Android 13+ permission prompt does not appear until a channel exists**, so channels are created before asking |
| Android permissions | `RECEIVE_BOOT_COMPLETED` is added by the library, so scheduled reminders are restored after a restart. `SCHEDULE_EXACT_ALARM` is only for exact timing (not used) |
| Config plugin | Not needed for local notifications in Expo Go; its options take effect in a new build only. Added with `color` and `enableRemoteNotifications: false` (no APNs entitlement, since nothing is pushed) |
| Notification icon (Android) | Must be a 96×96 all-white PNG with transparency. The repo has none (`android-icon-monochrome.png` is a 432×432 adaptive icon), so **no `icon` is set** and Android uses the app icon. Ask the designer for one (follow-up) |
| iOS pending limit | Not in the Expo docs. Apple's documented limit is the 64 soonest; the planner caps below it |
| Without `setNotificationHandler` | Notifications are shown with banner, list, sound and badge. Set it so a reminder while the app is open still shows a banner, without a badge |

## 1. Guardrails

1. **Read the SDK 58 docs** (`https://docs.expo.dev/versions/v58.0.0/sdk/notifications/`) before writing code
   (AGENTS.md). Anything below marked **(verify)** must be checked there, not assumed.
2. **Pure modules never import** `expo-*`, `react-native` or `@/lib/supabase`. The planner (`schedule.ts`) is pure.
3. **Appointment times are local wall-clock time.** Build `Date`s from their parts (`new Date(y, m, d, h, min)`).
   Never `toISOString()`, never convert to UTC.
4. **No health details in notification text** (decision N-D). No doctor, health service, condition, question or answer.
5. **Never log** notification content, phone numbers or ids.
6. Services return `Result<T>` and never throw to the UI; the notifications wrapper follows the same rule.
7. Tap targets 48dp, `accessibilityRole` and label on anything new; colours and spacing from `@/constants/theme`.
8. One commit per step with the suggested message (imperative, no prefix). Run `npm run typecheck`,
   `npm run lint` and `npm test` before each commit. Add every new tested file to `collectCoverageFrom`.
9. If something here conflicts with the repo, stop and tell the owner.

## 2. Decisions register

### Settled on 2 Nov 2026 (owner: Ryan Pham)

| ID | Decision | Why | Alternatives considered |
| --- | --- | --- | --- |
| N-A | **Reminders are scheduled on the phone** with `expo-notifications` local notifications, not pushed from a server. | Works in Expo Go ("Local notifications … remain available in Expo Go", SDK 58 docs); no new back end, migration or Edge Function; everything needed (settings, appointments, assessments) is already readable on the phone. | **Server push:** a device-token table, a scheduled Edge Function and the Expo push service; push doesn't work in Expo Go on Android since SDK 53, and CI can't test Edge Functions. Kept for later if reminders must reach phones that never open the app. |
| N-B | **Times:** assessment reminders and "the day before" at **9:00 am** local time. **"On the day" is 2 hours before** the appointment, but **not before 7:00 am**; for an appointment before 7:30 am it is 30 minutes before. Examples: 10:30 → 8:30; 8:00 → 7:00; 7:15 → 6:45. | 9 am is a reasonable waking hour. A fixed morning time is hours early for an afternoon appointment; 2 hours gives time to travel, and nobody is woken before 7 unless the appointment is that early. | Fixed 8 am on the day; a user-chosen time (needs a new column and design). |
| N-C | **"Every N days/weeks" counts from the last completed assessment** (the latest `date` across the five kinds). With no assessment yet, it is due now: the next 9:00 am (counting from when the app was opened would push it back every time the app opens). Saving an assessment resets it. If the user still hasn't done one, it repeats every N days/weeks. | The point is to "stay on track"; reminding someone who did an assessment yesterday is noise. | A fixed timetable from when the toggle was turned on, regardless of activity. |
| N-D | **Notification text has no health details.** Appointment: "Appointment tomorrow at 10:30" / "Appointment today at 10:30". Assessment: "Time for your health check-in". | Notifications show on the lock screen. Doctor, service and conditions are health information. | Including the doctor or service name. MHA may revisit the wording; changing it is one file. |
| N-E | **If permission is denied, the toggle goes back to off** and nothing is saved as on. The screen says notifications are turned off in the phone's settings, with an **Open settings** button. | The saved setting should match what the user will actually get. | Save "on" anyway and remind later. |

### Rules that follow from the above (no decision needed)

- Only **saved, future** appointments get reminders. Drafts and past appointments never do. A "day before"
  time that has already passed is skipped.
- **Only the phone the user is signed in on** gets reminders, and each phone plans its own.
- **Sign-out and account deletion cancel** every reminder on that phone.
- **The permission prompt appears when a toggle is turned on**, never at app start.
- **iOS keeps only the 64 soonest pending notifications per app** (Apple's limit; section 0.1). The planner caps the list and keeps the nearest first.
- **Android:** two channels, "Assessment reminders" and "Appointment reminders", and best-effort timing. No
  `SCHEDULE_EXACT_ALARM` (Google Play restricts it, and a few minutes' drift is fine for reminders).
- **Tapping a reminder:** an appointment reminder opens that appointment's Review screen
  (`/planner/review?appointmentId=…`) on top of the Care Planner list, so Back goes to the list. An assessment
  reminder opens `/home`, the **Pain Tracker** tab, which lists the five assessments with Record buttons (the
  `tracker` group has no screen of its own). A tap that starts the app opens once the patient tabs load.

### Out of scope

- Support person notifications (new request, patient changed access): need server push (later branch).
- A user-chosen reminder time, snooze, or quiet hours (no design).
- Reminders for the weekly reflection or medications.
- Push to a phone that has never opened the app since the appointment was made.

## 3. Phase map

| Phase | Steps | Depends on |
| --- | --- | --- |
| N0 Branch and recon | N0 | — |
| N1 Package and config | N1 | N0 |
| N2 Pure planner | N2 | N0 |
| N3 Notifications wrapper | N3 | N1 |
| N4 Keeping reminders up to date | N4 | N2, N3 |
| N5 Settings screen | N5 | N3 |
| N6 Tapping a reminder | N6 | N3 |
| N7 Clean-up on sign-out and deletion | N7 | N3 |
| N8 Docs, checks and manual QA | N8 | all |

## 4. Design

```
user_settings ─┐
appointments ──┼─► schedule.ts (pure) ──► Reminder[] ──► notifications service ──► expo-notifications
assessments ───┘        ▲                                    (cancel ours, schedule list)
                        │
         ReminderSync: sign-in, app back to foreground, settings saved,
                       appointment saved, assessment saved
```

### 4.1 Planner: `src/features/notifications/schedule.ts` (pure)

```ts
type Reminder = {
  id: string;                 // stable, e.g. 'appointment:42:day-before', 'assessment:0'
  kind: 'assessment' | 'appointment';
  at: Date;                   // local
  title: string;
  body: string;
  route: ReminderRoute;       // where a tap goes
};

planReminders(input: {
  settings: NotificationSettings;
  appointments: Appointment[];
  lastAssessmentDate: string | null;   // 'YYYY-MM-DD'
  now: Date;
}): Reminder[]
```

- Appointment reminders: for each saved appointment after `now`, a "day before" at 9:00 and/or an "on the day" at
  `min(max(start − 2h, 07:00 that day), start − 30 min)`, when those options are on and the time is after `now`.
- Assessment reminders: the next due time is `lastAssessmentDate + N days/weeks` at 9:00 (or the next 9:00 with no
  assessment); if that's already passed, the next 9:00 after `now`. Then repeats every N days/weeks.
- Sorted by time and capped (`MAX_PENDING`, below the iOS limit, with room for the assessment series).
- Text builders in `src/features/notifications/messages.ts` (N-D). Times use the app's 12-hour style
  (`formatTime`: "2:05 PM").
- Two reminders at the same time (both at 9:00) are ordered by id, so the result never depends on input order.

### 4.2 Wrapper: `src/services/notifications.ts`

- `getReminderPermission()`, `requestReminderPermission()`: `granted` / `denied` / `undetermined`.
- `ensureChannels()`: the two Android channels (must exist before the Android 13+ prompt appears, SDK 58 docs).
- `applyReminders(reminders)`: cancel the planned reminders (ids starting `appointment:` or `assessment:`),
  then schedule the list with `DATE` triggers. Returns `Result<void>`.
- `cancelAllReminders()`.
- `showRemindersWhileOpen()`: the notification handler (banner, list and sound while the app is open; no badge). Called once at start-up in N4.
- Channels use `AndroidImportance.DEFAULT` (sound, no pop-over banner on Android), and are created on Android only
  (iOS has none and logs a debug line if asked). `applyReminders` cancels only planned ids, so development test
  reminders survive a re-plan; `cancelAllReminders` cancels everything.
- Takes the `expo-notifications` module as the last optional argument, so tests pass a fake (like the Supabase client).

### 4.3 Keeping reminders up to date: `RemindersProvider`

- `src/features/notifications/RemindersContext.tsx` wraps the patient tabs (`app/(tabs)/_layout.tsx`), so only
  patients get reminders. `useReminders().refresh()` re-plans; outside the provider it does nothing.
- Re-plans on mount (sign-in or app start), when `AppState` becomes `active`, and on `refresh()`, which is called:
  - after a notification setting is saved (`useNotificationSettings`);
  - after an appointment is saved on the Review screen (drafts get no reminders, so editing a draft's details
    doesn't need one);
  - after each of the five assessments is saved (the last screen of each: pain `average`, movement and personal
    care `reflection`, social health `mood-trigger`, management `emotion`).
- One sync at a time; a `refresh()` during a sync runs one more afterwards.
- `syncReminders()` (`syncReminders.ts`): no permission → leaves everything alone; both kinds off → cancels;
  otherwise reads only what the settings need, plans, and schedules. **A failed read keeps the reminders already
  scheduled**, so a lost connection never wipes them.
- Sets the notification handler (`showRemindersWhileOpen`) once per app run. It returns a `Result` because
  `expo-notifications` throws when setting it under Jest.

### 4.4 Settings screen

- `useReminderPermission()` (`src/features/notifications/useReminderPermission.ts`): reads the permission without
  asking, reads it again when the app returns to the foreground (the person may have changed it in the phone's
  settings), `ensure()` asks only when needed, and `openSettings()` opens the app's page in the phone's settings.
- Turning either toggle **on** calls `ensure()` first. Allowed: save as before. Refused: nothing is saved, so the
  toggle stays off (N-E). Turning a toggle off never asks.
- While permission is denied, the screen says "Notifications are turned off for MPowered in your phone's
  settings, so reminders can't be shown." with an **Open settings** button. This also covers permission taken
  away later in the phone's settings.
- The two toggles now have accessibility labels ("Assessment reminders", "Appointment reminders"); before, both
  were unnamed switches.

## 5. Steps

### Phase N0 — Branch and recon
- **N0** Branch from `main` (done). Confirm section 0 against the repo. Check in the SDK 58 docs: the
  iOS pending limit, `DATE` trigger shape, Android channel and permission behaviour, and whether the config
  plugin is needed for local notifications. Record answers in this file.
  Commit: `Add the notifications build plan` (this file and the progress checklist).

### Phase N1 — Package and config
- **N1** `npx expo install expo-notifications`; add `"expo-notifications"` to `plugins` in `app.json` with
  `color` and `enableRemoteNotifications: false` (section 0.1; no icon yet). Note in the PR that a dev build must
  be rebuilt; Expo Go needs nothing.
  Commit: `Add expo-notifications`

### Phase N2 — Pure planner
- **N2** `src/features/notifications/schedule.ts` and `messages.ts` with tests.
  Commit: `Plan assessment and appointment reminders`

### Phase N3 — Notifications wrapper
- **N3** `src/services/notifications.ts` with tests (fake module).
  Commit: `Add the reminders service`

### Phase N4 — Keeping reminders up to date
- **N4** `syncReminders.ts`, the `RemindersProvider` context in the tabs layout, and `refresh()` calls after
  settings, appointment and assessment saves (section 4.3).
  Commit: `Keep reminders up to date`

### Phase N5 — Settings screen
- **N5** Permission on turning a toggle on; denied message and Open settings (N-E).
  Commit: `Ask for notification permission from Settings`

### Phase N6 — Tapping a reminder
- **N6** Pure `readReminderTarget()` and `routeForReminder()` (`reminderRoute.ts`) with tests;
  `useOpenTappedReminder()` (uses `useLastNotificationResponse()`, then clears it) called in the patient tabs layout,
  so it only runs once signed in. `jest.setup.js` makes `useLastNotificationResponse` return null under Jest, where
  the real hook crashes for lack of a native module.
  Commit: `Open the right screen from a reminder`

### Phase N7 — Clean-up
- **N7** `signOut()` (`src/services/auth.ts`) calls `cancelAllReminders()` first, even if signing out then fails.
  That covers both Sign out buttons and account deletion (`useAccountDeletion` signs out once the account is
  gone). `AuthContext` also cancels on Supabase's `SIGNED_OUT` event, for a session that ends without Sign out.
  Commit: `Cancel reminders on sign-out and account deletion`

### Phase N8 — Docs, checks and manual QA
- **N8a** A **Developer** section on the Notifications screen, in development builds only (`__DEV__`). Each
  test reminder arrives after 10 seconds with the real wording (`testReminders.ts`):
  - "Test appointment reminder (day before)" and "(on the day)": use the next saved appointment's time and open
    its plan when tapped; without one they say 10:30 AM and open nothing.
  - "Test assessment reminder": opens the Pain Tracker home.
  - "Re-plan reminders now": runs a re-plan and says what happened (scheduled, cancelled, no permission, or a
    failed read) and how many are scheduled.
  - "Show scheduled reminders": each scheduled notification's id and title.

  Test reminders' ids start with `test-reminder:`, and a re-plan cancels only planned ids (`appointment:`,
  `assessment:`), so a re-plan (for example after the iPhone permission prompt) no longer cancels a test reminder.
  Sign-out still cancels everything.
- **N8b** Update `docs/testing.md`, `settings-backend.md` (reminders now sent) and `progress.md`. Full checks, green CI.
  Commit: `Update the docs for notifications`
- **N8c** Manual QA on a real iPhone and Android phone (section 6.4). Results go in the PR.

## 6. Testing plan

### 6.1 Strategy
- The logic that matters (what fires, when) is in the pure planner, so it gets the most tests.
- `expo-notifications` is faked in Jest; whether the phone actually shows a notification is manual.
- No pgTAP or migration; `database-tests` should be unchanged.

### 6.2 Jest tests

| File | Covers |
| --- | --- |
| `schedule.test.ts` | Each toggle off/on; day before at 9:00; on the day at 2 h before, not before 7:00, 30 min before for early appointments; past and draft appointments skipped; a passed "day before" skipped; every N days and weeks from the last assessment; no assessment yet; overdue; the cap keeps the nearest; local times kept across the daylight saving change (first Sunday in October / April); ids stable |
| `messages.test.ts` | Wording has no doctor, service or condition (N-D); today/tomorrow |
| `notifications.test.ts` | Permission states; channels created before asking; apply cancels then schedules; errors become `Result` failures |
| `syncReminders.test.ts` | No permission leaves things alone; both off cancels; reads only what's needed; a failed read keeps what's scheduled |
| `RemindersContext.test.tsx` | Re-plans on mount, foreground and `refresh()`; one sync at a time with one more for refreshes during it; an error doesn't stop it; no-op outside the provider |
| `reminderRoute.test.ts` | Reads only well-formed targets; appointment → Review with its id; assessment → Pain Tracker home |
| `useOpenTappedReminder.test.ts` | Opens the plan on top of the Care Planner list; assessment → home; ignores non-taps and unknown notifications; clears each tap |
| `useReminderPermission.test.ts` | Reads without asking; doesn't ask when allowed; asks when undecided; refusal marks denied; a failed read is unknown, not refused; re-reads on foreground; opens settings |
| `__tests__/notifications-settings.test.tsx` | Turning on asks then saves; refused saves nothing; turning off never asks; the denied message and Open settings |
| `auth.test.ts` (extend) | Reminders cancelled before signing out; signing out still happens if cancelling fails. `useAccountDeletion.test.ts` already checks it signs out |

### 6.3 Rows to add to `docs/testing.md`
- Reminders only for saved future appointments, at the chosen times.
- Assessment reminders follow the chosen frequency from the last assessment.
- Notification text contains no health details.
- Denied permission leaves reminders off.
- Sign-out and account deletion cancel reminders.

### 6.4 Manual QA (not automated)
On an iPhone (Expo Go) and an Android phone:
1. Turn on appointment reminders: the permission prompt appears. Deny: the toggle goes back off with Open settings.
2. Allow; turn on the day before and on the day; add an appointment for tomorrow: both reminders are pending
   (dev row lists them, or wait for the test reminder).
3. Each Developer test reminder: it arrives about 10 seconds later with the app closed, and tapping opens the right screen.
4. Change the appointment time: the reminders move. Delete it, or make it a past time: they go.
5. Assessment every 1 day: complete an assessment, the next reminder is tomorrow at 9:00.
6. Lock screen shows no doctor or service.
7. Sign out: no reminders arrive.
8. Turn notifications off in the phone's settings: the screen says so.

## 7. Requirements traceability

| Requirement | Where |
| --- | --- |
| US15: receive reminders for appointments and assessments | N2–N4, N6 |
| US22: toggle reminders and their frequency | N5 (existing toggles, now effective) |
