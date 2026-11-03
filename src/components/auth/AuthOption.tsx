import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { makeStyles, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type AuthOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** One answer in a pick-one question, as a wide pill. The chosen one has an outline as well as a tint. */
export function AuthOption({ label, selected, onPress }: AuthOptionProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}>
      <AppText variant="labelLargeBold" color="primary">
        {label}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  option: {
    minHeight: MinTapTarget + Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: Radius.pill,
    backgroundColor: colors.surfaceContainer,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondaryContainer,
  },
  pressed: {
    opacity: 0.8,
  },
}));
