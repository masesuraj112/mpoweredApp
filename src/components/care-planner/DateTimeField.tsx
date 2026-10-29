import { Pressable, Text, View } from 'react-native';

import { fieldStyles } from '@/components/ui/fieldStyles';
import { CalendarIcon } from '@/components/ui/icons';

type DateTimeFieldProps = {
  label: string;
  placeholder: string;
  /** The formatted value, or null when nothing has been chosen. */
  displayValue: string | null;
  error?: string | null;
  onPress: () => void;
};

/** The "Appointment date and time" field. Pressing it opens the picker. */
export function DateTimeField({ label, placeholder, displayValue, error, onPress }: DateTimeFieldProps) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: displayValue ?? 'Not chosen yet' }}
        accessibilityHint="Opens the calendar and time"
        onPress={onPress}
        style={[fieldStyles.box, error ? fieldStyles.boxError : null]}>
        <Text style={[fieldStyles.value, displayValue === null && fieldStyles.placeholder]}>
          {displayValue ?? placeholder}
        </Text>
        <CalendarIcon />
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={fieldStyles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
