import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
export function AssessmentHeader() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  // The bar's colour runs up behind the status bar to the top of the screen.
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
      <Pressable
        onPress={() => router.replace('/home')}
        accessibilityRole="button"
        accessibilityLabel="Back to Home"
        style={styles.backButton}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Back to Home</Text>
      </Pressable>
      <Text style={styles.topBarTitle}>Pain Tracker</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  topBar: {
    backgroundColor: colors.secondaryContainer,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  backArrow: {
    ...Typography.headline,
    color: colors.textSecondary,
    marginRight: Spacing.two,
  },
  backText: {
    ...Typography.bodyLarge,
    color: colors.textSecondary,
  },
  topBarTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
}));
