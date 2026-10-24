import { StyleSheet, Text } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';

export function SponsorFooter() {
  return <Text style={styles.text}>Supported by ABBVIE</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...Typography.labelLargeBold,
    paddingHorizontal: Spacing.five,
    textAlign: 'center',
    color: Colors.light.text,
  },
});
