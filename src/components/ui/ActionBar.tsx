import { Children, type ReactNode } from 'react';
import { View } from 'react-native';

import { Spacing, makeStyles } from '@/constants/theme';

type ActionBarProps = {
  /** The buttons. `single` is one centred button; `pair` is two side by side. */
  children: ReactNode;
  layout?: 'single' | 'pair';
};

/** Bar at the bottom of a screen. It sits below the scrolling content, never over it. */
export function ActionBar({ children, layout = 'single' }: ActionBarProps) {
  const styles = useStyles();
  const pair = layout === 'pair';

  return (
    <View style={[styles.bar, pair ? styles.pairBar : styles.singleBar]}>
      {Children.map(children, (child) =>
        child ? <View style={pair ? styles.pairItem : styles.singleItem}>{child}</View> : null,
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  bar: {
    paddingVertical: Spacing.two,
    borderTopWidth: 2,
    borderTopColor: colors.backgroundElement,
    backgroundColor: colors.background,
  },
  singleBar: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
  },
  pairBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  singleItem: {
    width: '100%',
    maxWidth: 250,
  },
  pairItem: {
    flex: 1,
    maxWidth: 160,
  },
}));
