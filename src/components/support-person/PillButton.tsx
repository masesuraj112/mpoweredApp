import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

const arrowIcon = require('../../../assets/images/support-person/arrow-right.svg');

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** small: "Add questions" on an appointment. large: full-width "View more appointments". */
  size?: 'small' | 'large';
};

/** Purple rounded button with a white arrow (Figma 3911-24700, 3911-24669). */
export function PillButton({ label, onPress, size = 'small' }: PillButtonProps) {
  const large = size === 'large';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, large ? styles.large : styles.small, pressed && styles.pressed]}
    >
      <AppText variant={large ? 'labelLarge' : 'labelMedium'} color="onPrimary" numberOfLines={1}>
        {label}
      </AppText>
      <Image source={arrowIcon} style={styles.arrow} contentFit="contain" accessibilityLabel="" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
  small: {
    alignSelf: 'flex-end',
    gap: Spacing.mid,
    paddingHorizontal: Spacing.three,
  },
  large: {
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.8,
  },
  arrow: {
    width: 15,
    height: 15,
  },
});
