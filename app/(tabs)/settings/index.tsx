import { Colors } from '@/constants/theme';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SettingsRowProps = {
  icon: string;
  asset?: number;
  label: string;
  onPress?: () => void;
};

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const accountIcon = require('../../../assets/images/settings/account.svg');
const notificationsIcon = require('../../../assets/images/settings/notifications.svg');
const supportPersonsIcon = require('../../../assets/images/settings/support-persons.svg');
const displayIcon = require('../../../assets/images/settings/display.svg');

const SETTINGS_ROWS: SettingsRowProps[] = [
  { icon: '', asset: accountIcon, label: 'Account', onPress: () => router.push('/settings/profile') },
  { icon: '', asset: notificationsIcon, label: 'Notifications', onPress: () => router.push('/settings/notifications') },
  { icon: '', asset: supportPersonsIcon, label: 'Support Persons', onPress: () => router.push('/settings/support-persons') },
  { icon: '', asset: displayIcon, label: 'Display', onPress: () => router.push('/settings/display') },
  { icon: '', asset: privacyIcon, label: 'Privacy/Data and Legal', onPress: () => router.push('/settings/legal') },
];

export default function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Sign out failed', error.message);
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.titleDivider} />

      <View style={styles.rowsCard}>
        {SETTINGS_ROWS.map((row, index) => (
          <SettingsRow
            key={row.label}
            {...row}
            isLast={index === SETTINGS_ROWS.length - 1}
          />
        ))}
      </View>

      <Pressable
        onPress={handleSignOut}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        accessibilityState={{ disabled: isSigningOut }}
        style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutPressed]}
      >
        {isSigningOut ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signOutText}>Sign out</Text>}
      </Pressable>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, asset, label, onPress, isLast }: SettingsRowProps & { isLast: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
    >
      {asset ? (
        <Image source={asset} style={styles.rowIcon} contentFit="contain" accessibilityLabel="" />
      ) : (
        <Text style={styles.rowIcon} accessibilityElementsHidden>{icon}</Text>
      )}
      <Text style={styles.rowLabel}>{label}</Text>
      {onPress && <Text style={styles.chevron} accessibilityElementsHidden>→</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: scaleWidth(29),
    paddingTop: scaleHeight(36),
    backgroundColor: Colors.light.background,
  },
  title: {
    color: '#000000',
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  titleDivider: {
    height: 1,
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(23),
    backgroundColor: Colors.light.outline,
  },
  rowsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: scaleWidth(12),
    paddingHorizontal: scaleWidth(20),
  },
  row: {
    minHeight: scaleHeight(76),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    color: Colors.light.onSurfaceVariant,
    fontSize: scaleFont(21),
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    color: Colors.light.onSurface,
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
  chevron: {
    color: '#000000',
    fontSize: scaleFont(26),
    lineHeight: scaleFont(26),
  },
  signOutButton: {
    height: scaleHeight(55),
    marginTop: scaleHeight(23),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(8),
    backgroundColor: Colors.light.primary,
  },
  signOutPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
});
