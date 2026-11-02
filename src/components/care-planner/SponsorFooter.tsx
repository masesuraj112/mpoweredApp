import { Text } from 'react-native';

import { Spacing, Typography, makeStyles } from '@/constants/theme';

export function SponsorFooter() {
  const styles = useStyles();
  return <Text style={styles.text}>Supported by ABBVIE</Text>;
}

const useStyles = makeStyles((colors) => ({
  text: {
    ...Typography.labelLargeBold,
    paddingHorizontal: Spacing.five,
    textAlign: 'center',
    color: colors.text,
  },
}));
