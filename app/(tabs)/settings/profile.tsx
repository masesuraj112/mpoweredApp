import { SettingsModal, SettingsModalField, SettingsModalText } from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const passwordIcon = require('../../../assets/images/settings/password.svg');
const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

// Keep this in line with the minimum length set in Supabase (Auth settings).
const PASSWORD_MIN_LENGTH = 8;

export default function ProfileScreen() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [name, setName] = useState('Sarah McLachlan');
  const [dateOfBirth, setDateOfBirth] = useState('28/01/1968');
  const [email, setEmail] = useState('sarah.mclachlan@gmail.com');

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
      <SettingsOption icon={accountIcon} label="Personal details" onPress={() => setIsPersonalDetailsOpen(true)} />
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
      >
        <SettingsModalField label="Name" value={name} onChangeText={setName} />
        <SettingsModalField label="Date of Birth" value={dateOfBirth} onChangeText={setDateOfBirth} />
        <SettingsModalField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
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
