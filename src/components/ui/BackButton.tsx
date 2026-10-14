import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type BackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function BackButton({ onPress, label = 'Back' }: BackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.target, pressed && styles.pressed]}>
      <View style={styles.pill}>
        <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.text}>
          ←
        </Text>
        <Text style={styles.text}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    alignSelf: 'flex-start',
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.secondaryContainer,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Colors.light.onSecondaryContainer,
  },
  pressed: {
    opacity: 0.8,
  },
});
