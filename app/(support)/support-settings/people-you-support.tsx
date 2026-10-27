import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalInfoRow,
  SettingsModalSection,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useSupportPerson } from '@/features/support-person/context';
import type { SupportedPatient } from '@/features/support-person/types';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const unlinkIcon = require('../../../assets/images/support-person/unlink.svg');

const permissionText = (allowed: boolean) => (allowed ? 'Allowed' : 'Not allowed');

/** The patients this support person supports, with a popup to see access and unpair (Figma 3911-24201, 3911-24318). */
export default function PeopleYouSupportScreen() {
  const { status, reload, patients, unpair } = useSupportPerson();
  const [selected, setSelected] = useState<SupportedPatient | null>(null);
  const [unpairError, setUnpairError] = useState('');

  const open = (patient: SupportedPatient) => {
    setUnpairError('');
    setSelected(patient);
  };

  const confirmUnpair = (patient: SupportedPatient) => {
    const firstName = patient.name.split(' ')[0];
    const message = `You'll no longer see ${firstName}'s appointments. ${firstName} would need to send a new request to add you again.`;
    // The popup only closes once the unpair has saved; otherwise it stays open with the error.
    const doUnpair = async () => {
      const error = await unpair(patient.id);
      if (error) {
        setUnpairError('We could not unpair. Please check your connection and try again.');
        return;
      }
      setSelected(null);
    };

    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
    if (Platform.OS === 'web') {
      if (window.confirm(message)) doUnpair();
      return;
    }

    Alert.alert(`Unpair from ${firstName}?`, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unpair', style: 'destructive', onPress: doUnpair },
    ]);
  };

  return (
    <SettingsSubpage title="People you support">
      <Text style={styles.sectionTitle}>Manage people you support</Text>
      {status === 'loading' ? (
        <LoadingState label="Loading the people you support" />
      ) : status === 'error' ? (
        <ErrorState message="We could not load the people you support." onRetry={reload} />
      ) : patients.length === 0 ? (
        <Text style={settingsSubpageStyles.placeholder}>You aren’t supporting anyone yet.</Text>
      ) : (
        patients.map(patient => (
          <SettingsOption key={patient.id} icon={accountIcon} label={patient.name} onPress={() => open(patient)} />
        ))
      )}

      {selected && (
        <SettingsModal
          visible
          title="Manage person you support"
          scrollable
          onClose={() => setSelected(null)}
          errorMessage={unpairError}
        >
          <SettingsModalField label="Name" value={selected.name} editable={false} showEditIcon={false} />
          {/* Only the patient can change these, so they're shown read-only. */}
          <SettingsModalSection title="Your access permissions">
            <SettingsModalGroup>
              <SettingsModalInfoRow label="Add questions" value={permissionText(selected.canAddQuestions)} />
              <SettingsModalInfoRow label="Add doctor’s answers" value={permissionText(selected.canAddAnswers)} />
              <SettingsModalActionRow
                label={`Unpair from ${selected.name.split(' ')[0]}`}
                icon={unlinkIcon}
                destructive
                onPress={() => confirmUnpair(selected)}
              />
            </SettingsModalGroup>
          </SettingsModalSection>
        </SettingsModal>
      )}
    </SettingsSubpage>
  );
}

const styles = StyleSheet.create({
  // Same as "Manage support persons" on the patient's Support Persons page.
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
});
