import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';

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
      <Text style={[styles.text, textStyle]} allowFontScaling={false}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 0,
    justifyContent: 'center',
    paddingLeft: scaleWidth(32), // room for the 20pt radio plus a gap
    paddingRight: scaleWidth(8),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  radio: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -scaleWidth(10), // half the radio height, to centre it
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderWidth: 2,
    borderColor: '#49454F',
    borderRadius: scaleWidth(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#5B4A9E',
  },
  radioDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    backgroundColor: '#5B4A9E',
  },
  text: {
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
  },
});
