import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';

type SummaryStatusProps = {
  state: { status: 'loading' } | { status: 'error'; message: string };
  onClose: () => void;
};

/** What a tracker summary screen shows while its entry loads, or when it could not be shown. */
export function SummaryStatus({ state, onClose }: SummaryStatusProps) {
  return (
    <Screen scroll={false}>
      <View style={styles.centered}>
        {state.status === 'loading' ? (
          <ActivityIndicator accessibilityLabel="Loading your summary" />
        ) : (
          <>
            <AppText
              accessibilityRole="alert"
              variant="bodyMediumRegular"
              color="onSurface"
              style={styles.message}>
              {state.message}
            </AppText>
            <Button
              label="Close"
              variant="outlined"
              accessibilityLabel="Close summary"
              onPress={onClose}
            />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  message: {
    textAlign: 'center',
  },
});
