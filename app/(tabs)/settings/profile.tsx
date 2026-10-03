import { SettingsModal, SettingsModalField } from '@/components/mpowered/SettingsModal';
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
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const closeChangePassword = () => {
    setIsChangePasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      Alert.alert('Password too short', `Your new password needs at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords don't match", 'Enter the same new password in both boxes.');
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert('Choose a different password', 'Your new password must be different from your existing one.');
      return;
    }

    setIsSavingPassword(true);
    try {
      // Supabase doesn't check the old password itself, so confirm it by signing in again with it.
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const accountEmail = userData.user?.email;
      if (userError || !accountEmail) {
        Alert.alert('Something went wrong', 'We could not find your account. Please sign in again.');
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: currentPassword,
      });
      if (verifyError) {
        Alert.alert(
          verifyError.status === 400 ? 'Incorrect password' : 'Password change failed',
          verifyError.status === 400 ? 'Your existing password is incorrect.' : verifyError.message,
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        Alert.alert('Password change failed', updateError.message);
        return;
      }

      Alert.alert('Password updated', 'Your password has been changed.', [{ text: 'OK', onPress: closeChangePassword }]);
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
        title="Change password"
        onClose={closeChangePassword}
        onConfirm={handleChangePassword}
        confirmDisabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
      >
        <SettingsModalField label="Enter existing password" value={currentPassword} onChangeText={setCurrentPassword} password />
        <SettingsModalField
          label="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          password
          textContentType="newPassword"
          autoComplete="new-password"
        />
        <SettingsModalField
          label="Enter new password again"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          password
          textContentType="newPassword"
          autoComplete="new-password"
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
