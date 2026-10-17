import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, MinTapTarget } from '@/constants/theme';

type IconButtonProps = {
  icon: ImageSource;
  /** Required: an icon has no visible text, so say what it does (and for which item). */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** Size of the drawn icon. The touch target stays at least 48dp. */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  iconSize = 20,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.target, pressed && styles.pressed, style]}>
      <Image
        source={icon}
        contentFit="contain"
        tintColor={Colors.light.onSurfaceVariant}
        style={{ width: iconSize, height: iconSize }}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
