import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

type IntensityRowProps = {
  label: string;
  value: number;
  description: string;
};

/** One pain score with its plain-language description. Two sit side by side in the pain summary. */
export function IntensityRow({ label, value, description }: IntensityRowProps) {
  return (
    <View style={styles.row}>
      <AppText variant="labelMedium" color="onSurfaceVariant">
        {label}: {value}
      </AppText>
      <AppText variant="bodyMediumRegular" color="onSurface">
        {description}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '48%',
    gap: Spacing.one,
  },
});
