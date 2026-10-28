import { useEffect, useRef } from 'react';
import {
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';

import { Colors, Radius } from '@/constants/theme';

export type WheelItem = { key: string; label: string };

type TimeWheelProps = {
  /** Spoken name of the wheel, for example "Hour". */
  label: string;
  items: readonly WheelItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
};

const VISIBLE_ROWS = 3;

/**
 * One scrolling column of values. The middle row is the chosen one. A value can be chosen by
 * scrolling, by tapping it, or by a screen reader's increment and decrement actions.
 */
export function TimeWheel({ label, items, selectedIndex, onChange }: TimeWheelProps) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  // Rows grow with the system font size so large text is not clipped.
  const rowHeight = Math.min(96, Math.max(48, Math.round(48 * PixelRatio.getFontScale())));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * rowHeight, animated: false });
  }, [selectedIndex, rowHeight]);

  const settle = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / rowHeight);
    const clamped = Math.min(Math.max(index, 0), items.length - 1);
    if (clamped !== selectedIndex) onChange(clamped);
  };

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment' && selectedIndex < items.length - 1) {
      onChange(selectedIndex + 1);
    }
    if (event.nativeEvent.actionName === 'decrement' && selectedIndex > 0) {
      onChange(selectedIndex - 1);
    }
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[selectedIndex]?.label }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={handleAccessibilityAction}
      style={[styles.wheel, { height: rowHeight * VISIBLE_ROWS }]}>
      <View
        pointerEvents="none"
        style={[styles.band, { top: rowHeight, height: rowHeight }]}
      />
      <ScrollView
        ref={scrollRef}
        testID={`wheel-${label}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={rowHeight}
        decelerationRate="fast"
        nestedScrollEnabled
        contentOffset={{ x: 0, y: selectedIndex * rowHeight }}
        contentContainerStyle={{ paddingVertical: rowHeight }}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}>
        {items.map((item, index) => (
          <Pressable
            key={item.key}
            onPress={() => {
              onChange(index);
              scrollRef.current?.scrollTo({ y: index * rowHeight, animated: true });
            }}
            style={[styles.row, { height: rowHeight }]}>
            <Text style={[styles.text, index === selectedIndex && styles.textSelected]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    flex: 1,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: Radius.control - 2,
    backgroundColor: Colors.light.backgroundElement,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    lineHeight: 24,
    color: Colors.light.textSecondary,
  },
  textSelected: {
    fontWeight: '700',
    color: Colors.light.text,
  },
});
