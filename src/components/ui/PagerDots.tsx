import { Pressable, StyleSheet, View } from 'react-native';

import { Colors, MinTapTarget } from '@/constants/theme';

type PagerDotsProps = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
};

/** A row of tappable dots. Each dot announces "card N of COUNT" so paging never relies on swiping. */
export function PagerDots({ count, activeIndex, onSelect }: PagerDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, index) => {
        const active = index === activeIndex;
        return (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={`card ${index + 1} of ${count}`}
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.light.textSecondary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: Colors.light.outlineStrong,
  },
});
