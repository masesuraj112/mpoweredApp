import { ActivityIndicator, Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

import { SummaryCloseButton } from './SummaryReport';
import { TrackerQuestionScreen } from './TrackerQuestionScreen';

type SummaryStatusProps = {
  state: { status: 'loading' } | { status: 'error'; message: string };
  onClose: () => void;
  /** Spoken while loading. Defaults to "Loading your summary". */
  loadingLabel?: string;
};

/** What a tracker summary screen shows while its entry loads, or when it could not be shown. */
export function SummaryStatus({
  state,
  onClose,
  loadingLabel = 'Loading your summary',
}: SummaryStatusProps) {
  const styles = useStyles();
  return (
    <TrackerQuestionScreen title="My Pain Summary">
      <View style={styles.centered}>
        {state.status === 'loading' ? (
          <ActivityIndicator accessibilityLabel={loadingLabel} />
        ) : (
          <>
            <Text accessibilityRole="alert" style={styles.message}>
              {state.message}
            </Text>
            <SummaryCloseButton onPress={onClose} />
          </>
        )}
      </View>
    </TrackerQuestionScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  centered: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  message: {
    ...Typography.bodyLarge,
    color: colors.text,
    textAlign: 'center',
  },
}));
