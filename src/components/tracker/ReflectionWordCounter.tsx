import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';

/** "12 / 150 words" under a reflection box. Turns red and bold once the limit is passed. */
export function ReflectionWordCounter({ wordCount, overLimit }: { wordCount: number; overLimit: boolean }) {
  return (
    <AppText
      accessibilityLiveRegion="polite"
      variant={overLimit ? 'labelMedium' : 'bodySmall'}
      color={overLimit ? 'error' : 'onSurfaceVariant'}
      style={styles.counter}>
      {wordCount} / {MAX_REFLECTION_WORDS} words
    </AppText>
  );
}

const styles = StyleSheet.create({
  counter: {
    marginTop: Spacing.two,
    textAlign: 'right',
  },
});
