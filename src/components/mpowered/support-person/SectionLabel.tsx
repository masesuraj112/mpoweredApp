import { Text } from 'react-native';
import { makeStyles, Typography } from '@/constants/theme';

/** Small grey uppercase heading, e.g. "YOUR PERMISSIONS" or "UPCOMING APPOINTMENT". */
export function SectionLabel({ children }: { children: string }) {
  const styles = useStyles();
  return (
    <Text style={styles.label} accessibilityRole="header">
      {children.toUpperCase()}
    </Text>
  );
}

const useStyles = makeStyles((colors) => ({
  label: {
    color: colors.textSubtle,
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
}));
