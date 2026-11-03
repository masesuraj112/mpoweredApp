import { Pressable, Text, View } from 'react-native';

import { MinTapTarget, Radius, Spacing, Typography, makeStyles } from '@/constants/theme';
import { ArrowGlyph } from './icons';

type BackButtonProps = {
  onPress: () => void;
  label?: string;
};

export function BackButton({ onPress, label = 'Back' }: BackButtonProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.target, pressed && styles.pressed]}>
      <View style={styles.pill}>
        <ArrowGlyph direction="left" style={styles.text} />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
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
    backgroundColor: colors.secondaryContainer,
  },
  text: {
    ...Typography.bodyLarge,
    color: colors.onSecondaryContainer,
  },
  pressed: {
    opacity: 0.8,
  },
}));
