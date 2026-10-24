import {
  SettingsModal,
  SettingsModalGroup,
  SettingsModalInfoRow,
  SettingsModalText,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { formatForDisplay } from '@/features/auth/phone';
import { signOut } from '@/services/auth';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');

/**
 * The support person's Account page. Support persons sign up with only a name and a phone number and
 * sign in with an SMS code, so the patient page's date of birth, email, Change password and FaceID
 * don't apply (docs/support-person.md, section 4.2a).
 */
export default function SupportAccountScreen() {
  const { profile } = useAuth();
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) Alert.alert('Sign out failed', result.error.message);
  };

  return (
    <SettingsSubpage title="Account">
      <SettingsOption icon={accountIcon} label="Personal details" onPress={() => setIsPersonalDetailsOpen(true)} />
      <Pressable onPress={handleSignOut} style={styles.signOutButton} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <SettingsModal
        visible={isPersonalDetailsOpen}
        title="Personal details"
        hideCancel
        onClose={() => setIsPersonalDetailsOpen(false)}
      >
        <SettingsModalGroup>
          <SettingsModalInfoRow label="Name" value={profile?.name ?? 'Not available'} />
          <SettingsModalInfoRow
            label="Phone number"
            value={profile?.phone ? formatForDisplay(profile.phone) : 'Not provided'}
          />
        </SettingsModalGroup>
        {/* Users can't update their own users row yet, and a new phone number needs SMS re-verification. */}
        <SettingsModalText>
          These are the details you signed up with. They can’t be changed in the app yet.
        </SettingsModalText>
      </SettingsModal>
    </SettingsSubpage>
  );
}

// Same as the Sign out button on the patient's Account page.
const styles = StyleSheet.create({
  signOutButton: {
    height: 55,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  signOutText: {
    color: Colors.light.onPrimary,
    fontSize: 20,
  },
});
