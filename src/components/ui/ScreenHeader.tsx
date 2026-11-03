import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  onBack: () => void;
  /** The back control's text; it is also the spoken label. */
  backLabel?: string;
  /** Shown on the right, as the page title. */
  title?: string;
  /** Extra content under the bar, such as a title row. */
  children?: ReactNode;
};

/**
 * The lilac top bar: a back control on the left and the page title on the right. It pads for the status
 * bar from the safe-area inset, so it needs no fixed height. What Back does is up to the caller.
 */
export function ScreenHeader({ onBack, backLabel = 'Back', title, children }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <View style={[styles.bar, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={Spacing.two}
          onPress={onBack}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <AppText
            accessibilityElementsHidden
            importantForAccessibility="no"
            variant="headlineSmall"
            color="onSurfaceVariant"
            style={styles.chevron}>
            ‹
          </AppText>
          <AppText variant="bodyLarge" color="onSurfaceVariant">
            {backLabel}
          </AppText>
        </Pressable>
        {title ? (
          <AppText
            accessibilityRole="header"
            numberOfLines={1}
            variant="titleMedium"
            style={styles.title}>
            {title}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: Colors.light.secondaryContainer,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget,
  },
  chevron: {
    // The glyph sits low in its line box; nudge it to line up with the label.
    marginTop: -Spacing.one,
  },
  title: {
    flexShrink: 1,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.6,
  },
});
