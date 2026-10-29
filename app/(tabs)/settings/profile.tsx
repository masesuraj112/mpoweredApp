import {
  SettingsModal,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalInfoRow,
  SettingsModalText,
} from '@/components/mpowered/SettingsModal';
// Face ID is commented out until it comes back as an app lock (see docs/settings-backend.md, Q1).
// import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/context/AuthContext';
import { formatForDisplay } from '@/features/auth/phone';
import { usePersonalDetails } from '@/features/settings/usePersonalDetails';
import { signOut } from '@/services/auth';
import { NAME_MAX_LENGTH } from '@/services/validation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
// const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

export default function ProfileScreen() {
  const { refreshProfile } = useAuth();
  const { state, reload, saving, save } = usePersonalDetails();
  const details = state.status === 'ready' ? state.data : null;
  // const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  // --- Personal details popup -----------------------------------------------
  // The popup edits drafts, so Cancel discards changes and Ok saves them.
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  // Kept as typed, so a half-typed year isn't lost; checked on Ok.
  const [draftYear, setDraftYear] = useState('');
  const [personalDetailsError, setPersonalDetailsError] = useState('');

  const openPersonalDetails = () => {
    if (!details) return;
    setDraftName(details.name);
    setDraftYear(details.yearOfBirth === null ? '' : String(details.yearOfBirth));
    setPersonalDetailsError('');
    setIsPersonalDetailsOpen(true);
  };

  // Editing any field clears the previous error.
  const editPersonalDetailsField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPersonalDetailsError('');
  };

  // The popup stays open with the message if the save fails.
  const handleSavePersonalDetails = async () => {
    // Year of birth is optional, as at sign-up.
    const trimmedYear = draftYear.trim();
    const result = await save({ name: draftName, yearOfBirth: trimmedYear === '' ? null : Number(trimmedYear) });
    if (!result.ok) {
      setPersonalDetailsError(
        result.error.code === 'VALIDATION'
          ? result.error.message
          : 'We could not save your details. Please check your connection and try again.',
      );
      return;
    }
    // The name also shows elsewhere in the app, which reads it from the profile.
    refreshProfile();
    setIsPersonalDetailsOpen(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) Alert.alert('Sign out failed', result.error.message);
  };

  return (
    <SettingsSubpage title="Account">
      {state.status === 'loading' && <LoadingState label="Loading your details" />}
      {state.status === 'error' && <ErrorState message="We could not load your details." onRetry={reload} />}
      {state.status === 'ready' && (
        <SettingsOption icon={accountIcon} label="Personal details" onPress={openPersonalDetails} />
      )}
      {/* <SettingsOption
        icon={faceIdIcon}
        label="Enable FaceID"
        trailing={<SettingsToggle value={faceIdEnabled} onValueChange={setFaceIdEnabled} />}
      /> */}
      <Pressable onPress={handleSignOut} style={styles.signOutButton} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <SettingsModal
        visible={isPersonalDetailsOpen}
        title="Personal details"
        onClose={() => setIsPersonalDetailsOpen(false)}
        onConfirm={handleSavePersonalDetails}
        confirmDisabled={saving}
        errorMessage={personalDetailsError}
      >
        <SettingsModalField
          label="Name"
          value={draftName}
          onChangeText={editPersonalDetailsField(setDraftName)}
          textContentType="name"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
        />
        <SettingsModalField
          label="Year of birth (optional)"
          value={draftYear}
          onChangeText={editPersonalDetailsField(setDraftYear)}
          keyboardType="number-pad"
          maxLength={4}
        />
        <SettingsModalGroup>
          <SettingsModalInfoRow
            label="Phone number"
            value={details?.phone ? formatForDisplay(details.phone) : 'Not provided'}
          />
        </SettingsModalGroup>
        {/* A new phone number needs SMS re-verification (docs/settings-backend.md, Q2). */}
        <SettingsModalText>You sign in with this number, so it can’t be changed in the app yet.</SettingsModalText>
      </SettingsModal>
    </SettingsSubpage>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    height: 55,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#6750A4',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
