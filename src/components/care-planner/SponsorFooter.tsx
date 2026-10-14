import { StyleSheet, Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

export function SponsorFooter() {
  return <Text style={styles.text}>Supported by ABBVIE</Text>;
}

const styles = StyleSheet.create({
  text: {
    paddingHorizontal: Spacing.five,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    color: Colors.light.text,
  },
});
