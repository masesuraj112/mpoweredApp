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
import { useAuth } from '@/context/AuthContext';
import { formatForDisplay } from '@/features/auth/phone';
import { signOut } from '@/services/auth';
import { validateYearOfBirth } from '@/services/validation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
// const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

// Same limit as users.name and create_profile.
const NAME_MAX = 45;

export default function ProfileScreen() {
  const { profile } = useAuth();
  // const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  // TODO (plan commit 6): load the name and year with getPersonalDetails() and save them with updateProfile().
  const [name, setName] = useState(profile?.name ?? '');
  const [yearOfBirth, setYearOfBirth] = useState<number | null>(null);

  // --- Personal details popup -----------------------------------------------
  // The popup edits drafts, so Cancel discards changes and Ok saves them.
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  // Kept as typed, so a half-typed year isn't lost; checked on Ok.
  const [draftYear, setDraftYear] = useState('');
  const [personalDetailsError, setPersonalDetailsError] = useState('');

  const openPersonalDetails = () => {
    setDraftName(name);
    setDraftYear(yearOfBirth === null ? '' : String(yearOfBirth));
    setPersonalDetailsError('');
    setIsPersonalDetailsOpen(true);
  };

  // Editing any field clears the previous error.
  const editPersonalDetailsField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPersonalDetailsError('');
  };

  const handleSavePersonalDetails = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setPersonalDetailsError('Please enter your name.');
      return;
    }
    // Year of birth is optional, as at sign-up.
    const trimmedYear = draftYear.trim();
    const year = trimmedYear === '' ? null : Number(trimmedYear);
    const yearError = validateYearOfBirth(year);
    if (yearError) {
      setPersonalDetailsError(yearError);
      return;
    }

    setName(trimmedName);
    setYearOfBirth(year);
    setIsPersonalDetailsOpen(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) Alert.alert('Sign out failed', result.error.message);
  };

  return (
    <SettingsSubpage title="Account">
      <SettingsOption icon={accountIcon} label="Personal details" onPress={openPersonalDetails} />
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
        errorMessage={personalDetailsError}
      >
        <SettingsModalField
          label="Name"
          value={draftName}
          onChangeText={editPersonalDetailsField(setDraftName)}
          textContentType="name"
          autoComplete="name"
          maxLength={NAME_MAX}
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
            value={profile?.phone ? formatForDisplay(profile.phone) : 'Not provided'}
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
