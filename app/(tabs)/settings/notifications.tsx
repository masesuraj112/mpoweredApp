import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { useState } from 'react';
import { Text, View } from 'react-native';

export default function NotificationsScreen() {
  const [assessmentReminders, setAssessmentReminders] = useState(false);
  const [appointmentReminders, setAppointmentReminders] = useState(false);

  return (
    <SettingsSubpage title="Notifications">
      <Text style={styles.sectionTitle}>Assessment reminders</Text>
      <View style={styles.group}>
        <SettingsOption label="Turn on notifications" trailing={<SettingsToggle value={assessmentReminders} onValueChange={setAssessmentReminders} />} />
        <SettingsOption label="Set reminder frequency" onPress={() => undefined} />
      </View>
      <Text style={styles.sectionTitle}>Appointment reminders</Text>
      <View style={styles.group}>
        <SettingsOption label="Turn on notifications" trailing={<SettingsToggle value={appointmentReminders} onValueChange={setAppointmentReminders} />} />
        <SettingsOption label="Set reminder frequency" onPress={() => undefined} />
      </View>
    </SettingsSubpage>
  );
}

const styles = { sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 12 }, group: { marginBottom: 24 } };
