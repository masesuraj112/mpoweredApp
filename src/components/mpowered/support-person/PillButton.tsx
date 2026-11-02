import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { Image } from 'expo-image';
import { Pressable, Text } from 'react-native';

const arrowIcon = require('../../../../assets/images/support-person/arrow-right.svg');

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** small: "Add questions" on an appointment. large: full-width "View more appointments". */
  size?: 'small' | 'large';
};

/** Purple rounded button with a white arrow (Figma 3911-24700, 3911-24669). */
export function PillButton({ label, onPress, size = 'small' }: PillButtonProps) {
  const styles = useStyles();
  const large = size === 'large';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={large ? 0 : 6}
      style={({ pressed }) => [styles.button, large ? styles.large : styles.small, pressed && styles.pressed]}
    >
      <Text style={[styles.label, large ? styles.labelLarge : styles.labelSmall]} numberOfLines={1}>
        {label}
      </Text>
      <Image source={arrowIcon} style={styles.arrow} contentFit="contain" accessibilityLabel="" />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.control,
    backgroundColor: colors.primary,
    minHeight: MinTapTarget,
  },
  small: {
    alignSelf: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  large: {
    alignSelf: 'stretch',
    gap: Spacing.four,
    height: 39,
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: colors.onPrimary,
    fontWeight: '500',
  },
  labelSmall: {
    color: colors.text,
    ...Typography.caption,
    letterSpacing: 0.5,
  },
  labelLarge: {
    color: colors.text,
    ...Typography.bodySmall,
    letterSpacing: 0.1,
  },
  arrow: {
    width: 15,
    height: 15,
  },
}));
