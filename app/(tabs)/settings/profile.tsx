import { SettingsOption, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const passwordIcon = require('../../../assets/images/settings/password.svg');
const faceIdIcon = require('../../../assets/images/settings/faceid.svg');


export default function ProfileScreen() {
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  };

  return (
    <SettingsSubpage title="Account">
      <SettingsOption icon={accountIcon} label="Personal details" onPress={() => router.push('/settings/profile')} />
      <SettingsOption icon={passwordIcon} label="Change password" onPress={() => Alert.alert('Change password', 'Password changes coming soon.')} />
      <SettingsOption
        icon={faceIdIcon}
        label="Enable FaceID"
        trailing={<SettingsToggle value={faceIdEnabled} onValueChange={setFaceIdEnabled} />}
      />
      <Pressable onPress={handleSignOut} style={styles.signOutButton} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
