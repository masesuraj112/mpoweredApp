import { SettingsModal, SettingsModalDateField, SettingsModalField } from '@/components/mpowered/SettingsModal';
// Face ID is commented out until it comes back as an app lock (see docs/settings-backend.md, Q1).
// import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { signOut } from '@/services/auth';
import { isFutureDate, parseIsoDate } from '@/services/date';
import { validateEmail } from '@/services/validation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
// const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

export default function ProfileScreen() {
  // const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [name, setName] = useState('Sarah McLachlan');
  // Held as a local-midnight Date; stored as ISO YYYY-MM-DD and only formatted for display.
  const [dateOfBirth, setDateOfBirth] = useState(() => parseIsoDate('1968-01-28')!);
  const [email, setEmail] = useState('sarah.mclachlan@gmail.com');

  // --- Personal details popup -----------------------------------------------
  // The popup edits drafts, so Cancel discards changes and Ok saves them.
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDateOfBirth, setDraftDateOfBirth] = useState(dateOfBirth);
  const [draftEmail, setDraftEmail] = useState('');
  const [personalDetailsError, setPersonalDetailsError] = useState('');

  const openPersonalDetails = () => {
    setDraftName(name);
    setDraftDateOfBirth(dateOfBirth);
    setDraftEmail(email);
    setPersonalDetailsError('');
    setIsPersonalDetailsOpen(true);
  };

  // Editing any field clears the previous error.
  const editPersonalDetailsField =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setPersonalDetailsError('');
    };

  const handleSavePersonalDetails = () => {
    const trimmedName = draftName.trim();
    const trimmedEmail = draftEmail.trim();
    if (!trimmedName) {
      setPersonalDetailsError('Please enter your name.');
      return;
    }
    // The picker already blocks future dates; this guards against a stale maximumDate (e.g. past midnight).
    if (isFutureDate(draftDateOfBirth)) {
      setPersonalDetailsError("Date of birth can't be in the future.");
      return;
    }
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setPersonalDetailsError(emailError);
      return;
    }

    // TODO: save to Supabase, sending the date as toIsoDate(draftDateOfBirth) (YYYY-MM-DD).
    setName(trimmedName);
    setDateOfBirth(draftDateOfBirth);
    setEmail(trimmedEmail);
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
        />
        <SettingsModalDateField
          label="Date of Birth"
          value={draftDateOfBirth}
          onChange={editPersonalDetailsField(setDraftDateOfBirth)}
          maximumDate={new Date()}
        />
        <SettingsModalField
          label="Email"
          value={draftEmail}
          onChangeText={editPersonalDetailsField(setDraftEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          autoComplete="email"
        />
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
