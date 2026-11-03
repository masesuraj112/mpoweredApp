import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

/** One labelled answer in a summary: a small heading with the answer under it. */
export function ResultSection({ heading, value }: { heading: string; value: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="bodySmall" color="onSurfaceVariant">
        {heading}
      </AppText>
      <AppText variant="bodyMediumRegular" color="onSurface">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.half,
  },
});
