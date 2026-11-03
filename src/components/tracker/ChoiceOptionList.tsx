import type { ReactNode } from 'react';
import { View } from 'react-native';

import { makeStyles, Radius } from '@/constants/theme';

/**
 * The box that holds a question's answer options inside a `ChoiceCard`. It grows with its options, and the
 * page scrolls when they are longer than the screen.
 */
export function ChoiceOptionList({ children, testID }: { children: ReactNode; testID?: string }) {
  const styles = useStyles();
  return (
    <View testID={testID} style={styles.list}>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: {
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
}));
