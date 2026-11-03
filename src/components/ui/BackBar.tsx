import { Stack } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MinTapTarget, Spacing, Typography, makeStyles } from '@/constants/theme';

import { ArrowGlyph } from './icons';

type BackBarProps = {
  onPress: () => void;
  /** What the button says and screen readers hear, for example "Back to My Health". */
  label?: string;
  /** A short name for the section, shown at the other end of the bar, for example "Pain Tracker". */
  title?: string;
  disabled?: boolean;
};

/**
 * The bar at the top of a screen with a way back. Its colour runs up behind the status bar to the top of
 * the screen and across both edges. Use it as the screen's header with `BackBarHeader`, so it stays put
 * while the page scrolls under it.
 */
export function BackBar({ onPress, label = 'Back', title, disabled = false }: BackBarProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [styles.back, (pressed || disabled) && styles.pressed]}>
        <ArrowGlyph direction="left" style={styles.backText} />
        <Text style={styles.backText}>{label}</Text>
      </Pressable>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

/** Makes `BackBar` this screen's header. Put it anywhere in the screen's JSX. */
export function BackBarHeader(props: BackBarProps) {
  return <Stack.Screen options={{ headerShown: true, header: () => <BackBar {...props} /> }} />;
}

const useStyles = makeStyles((colors) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
    backgroundColor: colors.secondaryContainer,
  },
  back: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
  backText: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    color: colors.onSecondaryContainer,
  },
  title: {
    flexShrink: 1,
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
}));
