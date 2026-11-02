import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { makeStyles } from '@/constants/theme';
export function AssessmentHeader() {
  const styles = useStyles();
  return (
    <View style={styles.topBar}>
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
    height: scaleHeight(109),
    backgroundColor: colors.secondaryContainer,
    paddingTop: scaleHeight(52),
    paddingHorizontal: scaleWidth(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(40),
  },
  backArrow: {
    fontSize: scaleFont(28),
    lineHeight: scaleFont(28),
    color: colors.textSecondary,
    marginRight: scaleWidth(8),
  },
  backText: {
    fontSize: scaleFont(16),
    color: colors.textSecondary,
  },
  topBarTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: colors.text,
  },
}));
