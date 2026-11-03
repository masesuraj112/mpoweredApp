import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Screen } from '@/components/ui/Screen';
import { Colors } from '@/constants/theme';

type HealthSubpageProps = {
  /** The page's top bar, for example a `PrescriptionsHeader`. It stays put while the content scrolls. */
  header: ReactNode;
  children: ReactNode;
};

/**
 * The layout of the My Health sub-pages: the safe area, a header bar that stays pinned at the top, and
 * the padded, scrolling content under it. The header handles the status bar itself.
 */
export function HealthSubpage({ header, children }: HealthSubpageProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {header}
      <Screen edges={[]}>{children}</Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});
