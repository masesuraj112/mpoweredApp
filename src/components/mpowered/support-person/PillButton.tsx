import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

const arrowIcon = require('../../../../assets/images/support-person/arrow-right.svg');

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** small: "Add questions" on an appointment. large: full-width "View more appointments". */
  size?: 'small' | 'large';
  /** Placement only, e.g. sharing a row with another button. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Purple rounded button with a white arrow (Figma 3911-24700, 3911-24669). The large one is 48dp tall; the
 * small one is 40dp so two fit side by side on an appointment, with extra touch room making up the 48dp.
 */
export function PillButton({ label, onPress, size = 'small', style }: PillButtonProps) {
  const styles = useStyles();
  const colors = useThemeColors();
  const large = size === 'large';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={large ? Spacing.one : Spacing.two}
      style={({ pressed }) => [styles.button, large ? styles.large : styles.small, style, pressed && styles.pressed]}
    >
      <Text
        style={[styles.label, !large && styles.smallLabel]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}>
        {label}
      </Text>
      <Image
        source={arrowIcon}
        style={large ? styles.arrow : styles.smallArrow}
        contentFit="contain"
        tintColor={colors.onPrimary}
        accessibilityLabel=""
      />
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
  // On an appointment, in the row of actions under its details.
  small: {
    minHeight: 40,
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
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
  smallLabel: {
    ...Typography.labelLargeBold,
  },
  arrow: {
    width: 18,
    height: 18,
  },
  smallArrow: {
    width: 16,
    height: 16,
  },
}));
