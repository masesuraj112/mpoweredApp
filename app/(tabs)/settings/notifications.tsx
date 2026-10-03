import {
  SettingsModal,
  SettingsModalGroup,
  SettingsModalInlineRow,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { useState } from 'react';
import { Text, View } from 'react-native';

const COUNT_OPTIONS = ['1', '2', '3', '4', '5', '6', '7'];
const UNIT_OPTIONS = ['days', 'weeks'];

export default function NotificationsScreen() {
  const [assessmentReminders, setAssessmentReminders] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(false);

  // --- Screenshot 2: "Assessment reminders frequency" popup -----------------
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [count, setCount] = useState('3');
  const [unit, setUnit] = useState('days');
  const [draftCount, setDraftCount] = useState(count);
  const [draftUnit, setDraftUnit] = useState(unit);

  const openFrequency = () => {
    setDraftCount(count);
    setDraftUnit(unit);
    setFrequencyOpen(true);
  };
  const saveFrequency = () => {
    setCount(draftCount);
    setUnit(draftUnit);
    setFrequencyOpen(false);
  };

  // --- Screenshot 3: "Appointment reminders" popup --------------------------
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [dayBefore, setDayBefore] = useState(false);
  const [onTheDay, setOnTheDay] = useState(false);
  const [draftDayBefore, setDraftDayBefore] = useState(dayBefore);
  const [draftOnTheDay, setDraftOnTheDay] = useState(onTheDay);

  const openAppointment = () => {
    setDraftDayBefore(dayBefore);
    setDraftOnTheDay(onTheDay);
    setAppointmentOpen(true);
  };
  const saveAppointment = () => {
    setDayBefore(draftDayBefore);
    setOnTheDay(draftOnTheDay);
    setAppointmentOpen(false);
  };

  return (
    <SettingsSubpage title="Notifications">
      <Text style={styles.sectionTitle}>Assessment reminders</Text>
      <View style={styles.group}>
        <SettingsOption label="Turn on notifications" trailing={<SettingsToggle value={assessmentReminders} onValueChange={setAssessmentReminders} />} />
        <SettingsOption label="Set reminder frequency" onPress={openFrequency} />
      </View>
      <Text style={styles.sectionTitle}>Appointment reminders</Text>
      <View style={styles.group}>
        <SettingsOption label="Turn on notifications" trailing={<SettingsToggle value={appointmentReminders} onValueChange={setAppointmentReminders} />} />
        <SettingsOption label="Set reminder frequency" onPress={openAppointment} />
      </View>

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

const styles = { sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 12 }, group: { marginBottom: 24 } };
