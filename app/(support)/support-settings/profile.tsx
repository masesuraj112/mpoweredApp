import {
  SettingsModal,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalInfoRow,
  SettingsModalText,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { formatForDisplay } from '@/features/auth/phone';
import { signOut } from '@/services/auth';
import { updateProfile } from '@/services/profile';
import { NAME_MAX_LENGTH } from '@/services/validation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');

/**
 * The support person's Account page. Support persons sign up with only a name and a phone number and
 * sign in with an SMS code, so the patient page's year of birth, Change password and FaceID don't
 * apply (docs/support-person.md, section 4.2a). They can change their name (docs/settings-backend.md, Q3).
 */
export default function SupportAccountScreen() {
  const { profile, refreshProfile } = useAuth();
  const [isPersonalDetailsOpen, setIsPersonalDetailsOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const openPersonalDetails = () => {
    setDraftName(profile?.name ?? '');
    setError('');
    setIsPersonalDetailsOpen(true);
  };

  // The popup stays open with the message if the save fails.
  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ name: draftName, yearOfBirth: null });
    setSaving(false);
    if (!result.ok) {
      setError(
        result.error.code === 'VALIDATION'
          ? result.error.message
          : 'We could not save your name. Please check your connection and try again.',
      );
      return;
    }
    // The name shows elsewhere in the app (for example the greeting), which reads it from the profile.
    refreshProfile();
    setIsPersonalDetailsOpen(false);
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) Alert.alert('Sign out failed', result.error.message);
  };

  return (
    <SettingsSubpage title="Account">
      <SettingsOption icon={accountIcon} label="Personal details" onPress={openPersonalDetails} />
      <Pressable onPress={handleSignOut} style={styles.signOutButton} accessibilityRole="button">
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <SettingsModal
        visible={isPersonalDetailsOpen}
        title="Personal details"
        onClose={() => setIsPersonalDetailsOpen(false)}
        onConfirm={handleSave}
        confirmDisabled={saving}
        errorMessage={error}
      >
        <SettingsModalField
          label="Name"
          value={draftName}
          onChangeText={value => {
            setDraftName(value);
            setError('');
          }}
          textContentType="name"
          autoComplete="name"
          maxLength={NAME_MAX_LENGTH}
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
