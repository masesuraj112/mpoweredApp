import {
  SettingsModal,
  SettingsModalDateField,
  SettingsModalField,
  SettingsModalText,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { supabase } from '@/lib/supabase';
import { isFutureDate, parseIsoDate } from '@/services/date';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const passwordIcon = require('../../../assets/images/settings/password.svg');
const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

// Keep this in line with the minimum length set in Supabase (Auth settings).
const PASSWORD_MIN_LENGTH = 8;

// Loose sanity check only (something@something.tld); Supabase does the real validation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileScreen() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
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
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setPersonalDetailsError('Please enter a valid email address.');
      return;
    }

    // TODO: save to Supabase, sending the date as toIsoDate(draftDateOfBirth) (YYYY-MM-DD).
    setName(trimmedName);
    setDateOfBirth(draftDateOfBirth);
    setEmail(trimmedEmail);
    setIsPersonalDetailsOpen(false);
  };

  // --- Change password popup ------------------------------------------------
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  // After a successful change the same popup switches to a confirmation message.
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const closeChangePassword = () => {
    setIsChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsPasswordChanged(false);
  };

  // Typing in any field clears the previous error.
  const editPasswordField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPasswordError('');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setPasswordError(`New password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your existing password.');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError('');
    try {
      // Supabase doesn't check the old password itself, so confirm it by signing in again with it.
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const accountEmail = userData.user?.email;
      if (userError || !accountEmail) {
        setPasswordError("We couldn't find your account. Please sign in again.");
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: currentPassword,
      });
      if (verifyError) {
        setPasswordError(verifyError.status === 400 ? 'Your existing password is incorrect.' : verifyError.message);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }

      // Clear the typed passwords right away, then show the confirmation.
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordChanged(true);
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  };

  return (
    <SettingsSubpage title="Account">
      <SettingsOption icon={accountIcon} label="Personal details" onPress={openPersonalDetails} />
      <SettingsOption icon={passwordIcon} label="Change password" onPress={() => setIsChangePasswordOpen(true)} />
      <SettingsOption
        icon={faceIdIcon}
        label="Enable FaceID"
        trailing={<SettingsToggle value={faceIdEnabled} onValueChange={setFaceIdEnabled} />}
      />
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

      <SettingsModal
        visible={isChangePasswordOpen}
        title={isPasswordChanged ? 'Password changed' : 'Change password'}
        onClose={closeChangePassword}
        onConfirm={isPasswordChanged ? closeChangePassword : handleChangePassword}
        hideCancel={isPasswordChanged}
        errorMessage={passwordError}
        confirmDisabled={
          !isPasswordChanged && (isSavingPassword || !currentPassword || !newPassword || !confirmPassword)
        }
      >
        {isPasswordChanged ? (
          <SettingsModalText>Your password has been changed successfully.</SettingsModalText>
        ) : (
          <>
            <SettingsModalField
              label="Enter existing password"
              value={currentPassword}
              onChangeText={editPasswordField(setCurrentPassword)}
              password
            />
            <SettingsModalField
              label="Enter new password"
              value={newPassword}
              onChangeText={editPasswordField(setNewPassword)}
              password
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <SettingsModalField
              label="Enter new password again"
              value={confirmPassword}
              onChangeText={editPasswordField(setConfirmPassword)}
              password
              textContentType="newPassword"
              autoComplete="new-password"
            />
          </>
        )}
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
