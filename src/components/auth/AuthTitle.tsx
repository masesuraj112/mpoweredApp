import { StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';

/** The heading of a sign-in step, centred. */
export function AuthTitle({ children }: { children: string }) {
  return (
    <AppText accessibilityRole="header" variant="titleLarge" style={styles.title}>
      {children}
    </AppText>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
});
