import { Pressable, StyleProp, Text, TextStyle, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
interface AssessmentRadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Relative row height inside the options list (roughly the number of wrapped lines). */
  weight?: number;
  isLast?: boolean;
  /** Overrides font size / line height for screens with longer options. */
  textStyle?: StyleProp<TextStyle>;
}

export function AssessmentRadioRow({
  label,
  selected,
  onPress,
  weight = 1,
  isLast = false,
  textStyle,
}: AssessmentRadioRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[styles.row, { flex: weight }, !isLast && styles.divider]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      {/* Row heights are fixed by flex weight, so system font scaling would overflow them. */}
      <Text style={[styles.text, textStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    minHeight: 0,
    justifyContent: 'center',
    paddingLeft: Spacing.five, // room for the 20pt radio plus a gap
    paddingRight: Spacing.two,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  radio: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -10, // half the radio height, to centre it
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.outlineStrong,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: colors.primary,
  },
  text: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
}));
