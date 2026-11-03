import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, Text } from 'react-native';

const arrowIcon = require('../../../../assets/images/support-person/arrow-right.svg');

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** small: "Add questions" on an appointment. large: full-width "View more appointments". */
  size?: 'small' | 'large';
};

/**
 * Purple rounded button with a white arrow (Figma 3911-24700, 3911-24669). Both sizes share one label size
 * and a 48dp height, with extra touch room around them; they differ only in where they sit.
 */
export function PillButton({ label, onPress, size = 'small' }: PillButtonProps) {
  const styles = useStyles();
  const colors = useThemeColors();
  const large = size === 'large';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Spacing.one}
      style={({ pressed }) => [styles.button, large ? styles.large : styles.small, pressed && styles.pressed]}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Image source={arrowIcon} style={styles.arrow} contentFit="contain" tintColor={colors.onPrimary} accessibilityLabel="" />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: colors.primary,
  },
  // On an appointment, at its trailing edge.
  small: {
    alignSelf: 'flex-end',
  },
  // At the foot of a card, centred.
  large: {
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    flexShrink: 1,
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  arrow: {
    width: 18,
    height: 18,
  },
}));
