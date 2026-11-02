import {
  SettingsModal,
  SettingsModalGroup,
  SettingsModalInlineRow,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { makeStyles, Spacing, Typography } from '@/constants/theme';
import { syncReminders, type SyncOutcome } from '@/features/notifications/syncReminders';
import {
  nextSavedAppointment,
  TEST_REMINDER_LABELS,
  testReminder,
  type TestReminderKind,
} from '@/features/notifications/testReminders';
import { useReminderPermission } from '@/features/notifications/useReminderPermission';
import { useNotificationSettings } from '@/features/settings/useNotificationSettings';
import { listAppointments } from '@/services/care-planner';
import { listScheduledReminders, scheduleTestReminder } from '@/services/notifications';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const COUNT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'];

// Development only: what a re-plan did, for "Re-plan reminders now".
const SYNC_OUTCOME_TEXT: Record<SyncOutcome, string> = {
  scheduled: 'Planned and scheduled.',
  cancelled: 'Both kinds of reminder are off, so everything was cancelled.',
  'no-permission': 'Notifications are not allowed for this app, so nothing changed.',
  failed: 'Could not read the settings, appointments or assessments (connection or sign-in?).',
};
const UNIT_OPTIONS = ['days', 'weeks'];

/**
 * The patient's reminder choices. Turning reminders on asks the phone for permission first; if it's
 * refused the toggle stays off (docs/backend/notifications-build-plan.md, decision N-E).
 */
export default function NotificationsScreen() {
  const styles = useStyles();
  const { state, reload, settings, update, saveError } = useNotificationSettings();
  const permission = useReminderPermission();

  const turnOn = async (change: { assessmentReminders: boolean } | { appointmentReminders: boolean }) => {
    const on = Object.values(change)[0];
    if (on && !(await permission.ensure())) return;
    update(change);
  };

  // Development builds only (manual QA, docs/backend/notifications-build-plan.md section 6.4).
  const sendTestReminder = async (kind: TestReminderKind) => {
    if (!(await permission.ensure())) return;
    const appointments = kind === 'assessment' ? null : await listAppointments();
    const next = appointments?.ok ? nextSavedAppointment(appointments.data, new Date()) : null;
    const reminder = testReminder(kind, next);
    const result = await scheduleTestReminder(reminder);
    const opens = reminder.target ? '' : '\nThere is no saved appointment ahead, so tapping it opens nothing.';
    Alert.alert(
      'Test reminder',
      result.ok
        ? `It arrives in about 10 seconds. Leave the app or lock the phone to see it.${opens}`
        : 'It could not be scheduled.',
    );
  };
  const replanNow = async () => {
    const outcome = await syncReminders(new Date());
    const scheduled = await listScheduledReminders();
    const count = scheduled.ok ? scheduled.data.length : '?';
    Alert.alert('Re-plan reminders', `${SYNC_OUTCOME_TEXT[outcome]}\nScheduled now: ${count}`);
  };
  const showScheduled = async () => {
    const result = await listScheduledReminders();
    const lines = result.ok ? result.data.map(r => `${r.id}: ${r.title}`) : ['Could not read them.'];
    Alert.alert(`Scheduled reminders (${result.ok ? result.data.length : '?'})`, lines.join('\n') || 'None');
  };

  // --- Screenshot 2: "Assessment reminders frequency" popup -----------------
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [draftCount, setDraftCount] = useState('3');
  const [draftUnit, setDraftUnit] = useState('days');

  const openFrequency = () => {
    if (!settings) return;
    setDraftCount(String(settings.assessmentEvery));
    setDraftUnit(settings.assessmentUnit);
    setFrequencyOpen(true);
  };
  const saveFrequency = () => {
    setFrequencyOpen(false);
    update({ assessmentEvery: Number(draftCount), assessmentUnit: draftUnit === 'weeks' ? 'weeks' : 'days' });
  };

  // --- Screenshot 3: "Appointment reminders" popup --------------------------
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [draftDayBefore, setDraftDayBefore] = useState(false);
  const [draftOnTheDay, setDraftOnTheDay] = useState(false);

  const openAppointment = () => {
    if (!settings) return;
    setDraftDayBefore(settings.appointmentDayBefore);
    setDraftOnTheDay(settings.appointmentOnDay);
    setAppointmentOpen(true);
  };
  const saveAppointment = () => {
    setAppointmentOpen(false);
    update({ appointmentDayBefore: draftDayBefore, appointmentOnDay: draftOnTheDay });
  };

  return (
    <SettingsSubpage title="Notifications">
      {state.status === 'loading' && <LoadingState label="Loading your notification settings" />}
      {state.status === 'error' && (
        <ErrorState message="We could not load your notification settings." onRetry={reload} />
      )}
      {settings && (
        <>
          {/* A failed save has already put the previous value back. */}
          {saveError && (
            <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
              We could not save that change. Please check your connection and try again.
            </Text>
          )}
          {permission.denied && (
            <View style={styles.permission}>
              <Text style={styles.permissionText} accessibilityRole="alert">
                Notifications are turned off for MPowered in your phone’s settings, so reminders can’t be shown.
              </Text>
              <Button label="Open settings" variant="outlined" onPress={permission.openSettings} />
            </View>
          )}
          <Text style={styles.sectionTitle}>Assessment reminders</Text>
          <View style={styles.group}>
            <SettingsOption
              label="Turn on notifications"
              trailing={
                <SettingsToggle
                  value={settings.assessmentReminders}
                  accessibilityLabel="Assessment reminders"
                  onValueChange={value => turnOn({ assessmentReminders: value })}
                />
              }
            />
            <SettingsOption label="Set reminder frequency" onPress={openFrequency} />
          </View>
          <Text style={styles.sectionTitle}>Appointment reminders</Text>
          <View style={styles.group}>
            <SettingsOption
              label="Turn on notifications"
              trailing={
                <SettingsToggle
                  value={settings.appointmentReminders}
                  accessibilityLabel="Appointment reminders"
                  onValueChange={value => turnOn({ appointmentReminders: value })}
                />
              }
            />
            <SettingsOption label="Set reminder frequency" onPress={openAppointment} />
          </View>
          {__DEV__ && (
            <>
              <Text style={styles.sectionTitle}>Developer</Text>
              <View style={styles.group}>
                {(Object.keys(TEST_REMINDER_LABELS) as TestReminderKind[]).map(kind => (
                  <SettingsOption key={kind} label={TEST_REMINDER_LABELS[kind]} onPress={() => sendTestReminder(kind)} />
                ))}
                <SettingsOption label="Re-plan reminders now" onPress={replanNow} />
                <SettingsOption label="Show scheduled reminders" onPress={showScheduled} />
              </View>
            </>
          )}
        </>
      )}

      {/* Screenshot 2 */}
      <SettingsModal
        visible={frequencyOpen}
        title="Assessment reminders frequency"
        onClose={() => setFrequencyOpen(false)}
        onConfirm={saveFrequency}
      >
        <SettingsModalInlineRow label="Every">
          <SettingsSelect value={draftCount} options={COUNT_OPTIONS} onChange={setDraftCount} accessibilityLabel="Interval" />
          <SettingsSelect value={draftUnit} options={UNIT_OPTIONS} onChange={setDraftUnit} accessibilityLabel="Unit" />
        </SettingsModalInlineRow>
      </SettingsModal>

      {/* Screenshot 3 */}
      <SettingsModal
        visible={appointmentOpen}
        title="Appointment reminders"
        onClose={() => setAppointmentOpen(false)}
        onConfirm={saveAppointment}
      >
        <SettingsModalGroup>
          <SettingsModalToggleRow label="Notify me the day before" value={draftDayBefore} onValueChange={setDraftDayBefore} />
          <SettingsModalToggleRow label="Notify me on the day" value={draftOnTheDay} onValueChange={setDraftOnTheDay} />
        </SettingsModalGroup>
      </SettingsModal>
    </SettingsSubpage>
  );
}

const useStyles = makeStyles((colors) => ({
  sectionTitle: { color: colors.text, ...Typography.titleSmall, marginBottom: Spacing.two },
  group: { marginBottom: Spacing.four },
  errorText: { color: colors.error, ...Typography.bodySmall, marginBottom: Spacing.three },
  permission: { gap: Spacing.two, marginBottom: Spacing.four },
  permissionText: { color: colors.onSurface, ...Typography.bodySmall },
}));
