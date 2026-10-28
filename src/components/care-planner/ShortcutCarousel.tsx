import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { PagerDots } from '@/components/ui/PagerDots';
import { Colors, Spacing } from '@/constants/theme';

import { ShortcutCard } from './ShortcutCard';

export type Shortcut = {
  id: string;
  title: string;
  actionLabel: string;
  onPress: () => void;
};

type ShortcutCarouselProps = {
  shortcuts: Shortcut[];
};

const GUTTER = Spacing.five;
const GAP = Spacing.three;
/** How much of the next card stays visible so people can see there is more. */
const PEEK = 72;
const MIN_CARD_WIDTH = 240;
const MAX_CARD_WIDTH = 320;

/** Horizontally snapping row of shortcut cards with tappable pager dots. */
export function ShortcutCarousel({ shortcuts }: ShortcutCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<Shortcut>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = Math.min(
    MAX_CARD_WIDTH,
    Math.max(MIN_CARD_WIDTH, windowWidth - GUTTER - GAP - PEEK),
  );
  const interval = cardWidth + GAP;

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / interval);
      setActiveIndex(Math.min(Math.max(index, 0), shortcuts.length - 1));
    },
    [interval, shortcuts.length],
  );

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      listRef.current?.scrollToOffset({ offset: index * interval, animated: true });
    },
    [interval],
  );

  return (
    <View style={styles.band}>
      <FlatList
        ref={listRef}
        data={shortcuts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        snapToAlignment="start"
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <ShortcutCard
            title={item.title}
            actionLabel={item.actionLabel}
            onPress={item.onPress}
            style={{ width: cardWidth }}
          />
        )}
      />
      <View style={styles.dots}>
        <PagerDots count={shortcuts.length} activeIndex={activeIndex} onSelect={handleSelect} />
      </View>
    </View>
  );
}

function Separator() {
  return <View style={{ width: GAP }} />;
}

const styles = StyleSheet.create({
  band: {
    backgroundColor: Colors.light.backgroundElement,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.one,
  },
  content: {
    paddingHorizontal: GUTTER,
  },
  dots: {
    paddingHorizontal: GUTTER - Spacing.three,
  },
});
