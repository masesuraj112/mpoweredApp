import { Colors } from '@/constants/theme';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text } from 'react-native';

const arrowIcon = require('../../../../assets/images/support-person/arrow-right.svg');

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

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: Colors.light.primary,
  },
  small: {
    alignSelf: 'flex-end',
    gap: scaleWidth(10),
    paddingHorizontal: scaleWidth(15),
    paddingVertical: scaleHeight(3),
  },
  large: {
    alignSelf: 'stretch',
    gap: scaleWidth(21),
    height: scaleHeight(39),
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: '#FEF7FF',
    fontWeight: '500',
  },
  labelSmall: {
    fontSize: scaleFont(12),
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelLarge: {
    fontSize: scaleFont(14),
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  arrow: {
    width: 15,
    height: 15,
  },
});
