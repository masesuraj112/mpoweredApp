import { ContentColumn, Fonts, makeStyles, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
import { signOut } from '@/services/auth';

import { Image } from 'expo-image';

import { useState } from 'react';

import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';


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

        <Button
          label={isSigningOut ? 'Signing out…' : 'Sign out'}
          accessibilityLabel="Sign out"
          variant="outlined"
          onPress={handleSignOut}
          disabled={isSigningOut}
        />
      </ScrollView>
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
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
  },
  title: {
    color: colors.text,
    ...Typography.title,
  },
  titleDivider: {
    height: 1,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    backgroundColor: colors.divider,
  },
  rowsCard: {
    overflow: 'hidden',
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  row: {
    minHeight: 76,
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
    fontFamily: Fonts.headingRegular,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.onSurface,
    ...Typography.titleSmall,
    fontFamily: Fonts.headingRegular,
  },
  chevron: {
    color: colors.text,
    ...Typography.headline,
    fontFamily: Fonts.headingRegular,
  },
}));
