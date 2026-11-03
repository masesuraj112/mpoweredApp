import { ContentColumn, makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
import { signOut } from '@/services/auth';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowGlyph } from '@/components/ui/icons';

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>Settings</Text>
        <View style={styles.titleDivider} />

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
          style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutPressed]}
        >
          {isSigningOut ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.signOutText}>Sign out</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, asset, label, onPress, isLast }: SettingsRowProps & { isLast: boolean }) {
  const styles = useStyles();
  const colors = useThemeColors();
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
        // The icons are drawn in one colour, so tint them to the theme (they'd vanish in dark mode otherwise).
        <Image source={asset} style={styles.rowIcon} contentFit="contain" tintColor={colors.onSurfaceVariant} accessibilityLabel="" />
      ) : (
        <Text style={styles.rowIcon} accessibilityElementsHidden>{icon}</Text>
      )}
      <Text style={styles.rowLabel}>{label}</Text>
      {onPress && <ArrowGlyph style={styles.chevron} />}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  title: {
    color: colors.text,
    ...Typography.display,
  },
  titleDivider: {
    height: 1,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    backgroundColor: colors.divider,
  },
  // One outlined card of rows with lines between them, as on main.
  rowsCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
  },
  row: {
    minHeight: MinTapTarget + Spacing.four,
    paddingVertical: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowPressed: {
    opacity: 0.65,
  },
  rowIcon: {
    width: 24,
    height: 24,
    color: colors.onSurfaceVariant,
    ...Typography.titleSmall,
    fontWeight: '400',
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.onSurface,
    ...Typography.bodyLarge,
  },
  chevron: {
    color: colors.text,
    ...Typography.headlineSmall,
    fontWeight: '400',
  },
  // Full width with small corners, as on main, in the app's vibrant purple.
  signOutButton: {
    minHeight: MinTapTarget + Spacing.two,
    marginTop: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.medium,
    backgroundColor: colors.primary,
  },
  signOutPressed: {
    opacity: 0.8,
  },
  signOutText: {
    color: colors.onPrimary,
    ...Typography.titleMedium,
  },
}));
