import {
  SettingsModal,
  SettingsModalGroup,
  SettingsModalInlineRow,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors } from '@/constants/theme';
import { useNotificationSettings } from '@/features/settings/useNotificationSettings';
import { useState } from 'react';
import { Text, View } from 'react-native';

const COUNT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'];
const UNIT_OPTIONS = ['days', 'weeks'];

/** Saves the choices only: nothing sends reminders yet (docs/settings-backend.md, step 7). */
export default function NotificationsScreen() {
  const { state, reload, settings, update, saveError } = useNotificationSettings();

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
          <Text style={styles.sectionTitle}>Assessment reminders</Text>
          <View style={styles.group}>
            <SettingsOption
              label="Turn on notifications"
              trailing={
                <SettingsToggle
                  value={settings.assessmentReminders}
                  onValueChange={value => update({ assessmentReminders: value })}
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
                  onValueChange={value => update({ appointmentReminders: value })}
                />
              }
            />
            <SettingsOption label="Set reminder frequency" onPress={openAppointment} />
          </View>
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

const styles = {
  sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 12 },
  group: { marginBottom: 24 },
  errorText: { color: Colors.light.error, fontSize: 14, marginBottom: 16 },
};
