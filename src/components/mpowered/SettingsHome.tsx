import { makeStyles, useThemeColors } from '@/constants/theme';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { signOut } from '@/services/auth';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type SettingsRowProps = {
  icon: string;
  asset?: number;
  label: string;
  onPress?: () => void;
};

/**
 * Settings home: title, a card of rows that open subpages, and Sign out (Figma 3896-21559).
 * Shared by the patient app and the support person app, which pass different rows.
 */
export function SettingsHome({ rows }: { rows: SettingsRowProps[] }) {
  const styles = useStyles();
  const colors = useThemeColors();
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
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.titleDivider} />

      <View style={styles.rowsCard}>
        {rows.map((row, index) => (
          <SettingsRow
            key={row.label}
            {...row}
            isLast={index === rows.length - 1}
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
        {isSigningOut ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.signOutText}>Sign out</Text>}
      </Pressable>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, asset, label, onPress, isLast }: SettingsRowProps & { isLast: boolean }) {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    paddingHorizontal: scaleWidth(29),
    paddingTop: scaleHeight(36),
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  titleDivider: {
    height: 1,
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(23),
    backgroundColor: colors.divider,
  },
  rowsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outlineStrong,
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
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    color: colors.onSurfaceVariant,
    fontSize: scaleFont(21),
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.onSurface,
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
  chevron: {
    color: colors.text,
    fontSize: scaleFont(26),
    lineHeight: scaleFont(26),
  },
  signOutButton: {
    height: scaleHeight(55),
    marginTop: scaleHeight(23),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(8),
    backgroundColor: colors.primary,
  },
  signOutPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: colors.onPrimary,
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
}));
