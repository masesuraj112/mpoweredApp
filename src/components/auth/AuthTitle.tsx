import { Text } from 'react-native';

import { makeStyles, Typography } from '@/constants/theme';

/** The heading of a sign-in step, centred, in the page title font like every page's heading. */
export function AuthTitle({ children }: { children: string }) {
  const styles = useStyles();
  return (
    <Text accessibilityRole="header" style={styles.title}>
      {children}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  title: {
    ...Typography.display,
    color: colors.text,
    textAlign: 'center',
  },
}));
