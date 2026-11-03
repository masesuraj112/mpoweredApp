import { Pressable, View } from 'react-native';

import { MinTapTarget, makeStyles } from '@/constants/theme';

type PagerDotsProps = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  /** What each dot stands for in the spoken label ("card 2 of 3"). */
  itemLabel?: string;
};

/** A row of tappable dots. Each dot announces "card N of COUNT" so paging never relies on swiping. */
export function PagerDots({ count, activeIndex, onSelect, itemLabel = 'card' }: PagerDotsProps) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex;
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`${itemLabel} ${index + 1} of ${count}`}
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(index)}
            style={styles.target}>
            <View style={[styles.dot, active ? styles.dotActive : styles.dotInactive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  target: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.outlineStrong,
  },
}));
