import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { signOut } from '@/services/auth';

export type SettingsRowProps = {
  icon: string;
  asset?: number;
  label: string;
  onPress?: () => void;
};

const ICON_SIZE = 24;

/**
 * Settings home: title, a card of rows that open subpages, and Sign out (Figma 3896-21559).
 * Shared by the patient app and the support person app, which pass different rows.
 */
export function SettingsHome({ rows }: { rows: SettingsRowProps[] }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (!result.ok) {
        Alert.alert('Sign out failed', result.error.message);
      }
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Screen>
      <AppText accessibilityRole="header" variant="headlineSmall">
        Settings
      </AppText>
      <Divider style={styles.divider} />

      <View style={styles.rowsCard}>
        {rows.map((row, index) => (
          <SettingsRow key={row.label} {...row} isLast={index === rows.length - 1} />
        ))}
      </View>

      <Pressable
        onPress={handleSignOut}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
      >
        {isSigningOut ? (
          <ActivityIndicator color={Colors.light.onPrimary} />
        ) : (
          <AppText variant="titleMedium" color="onPrimary">
            Sign out
          </AppText>
        )}
      </Pressable>
    </Screen>
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
        <AppText
          accessibilityElementsHidden
          importantForAccessibility="no"
          variant="titleMedium"
          color="onSurfaceVariant"
          style={styles.rowIcon}
        >
          {icon}
        </AppText>
      )}
      <AppText variant="bodyLarge" color="onSurface" style={styles.rowLabel}>
        {label}
      </AppText>
      {onPress && (
        <AppText accessibilityElementsHidden importantForAccessibility="no" variant="headlineSmall">
          →
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  rowsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
  },
  row: {
    minHeight: MinTapTarget + Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
  },
  signOutButton: {
    minHeight: MinTapTarget + Spacing.two,
    marginTop: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    backgroundColor: Colors.light.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
