import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

const bellIcon = require('../../../assets/images/support-person/bell.svg');

type NotificationBellProps = {
  count: number;
  /** Leave out to show the bell as a plain indicator, e.g. on the requests screen itself. */
  onPress?: () => void;
};

/** Bell with a red count badge, hidden when there's nothing new (Figma 3911-24703). */
export function NotificationBell({ count, onPress }: NotificationBellProps) {
  const label = count > 0 ? `Support person requests, ${count} new` : 'Support person requests';
  const content = (
    <>
      <Image source={bellIcon} style={styles.bell} contentFit="contain" accessibilityLabel="" />
      {count > 0 && (
        <View style={styles.badge}>
          <AppText variant="labelSmall" color="onPrimary">
            {count > 9 ? '9+' : count}
          </AppText>
        </View>
      )}
    </>
  );

  if (!onPress) {
    return (
      <View style={styles.container} accessible accessibilityLabel={label}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MinTapTarget,
    height: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  bell: {
    width: 17,
    height: 21,
  },
  // The count sits on the bell's top-right corner.
  badge: {
    position: 'absolute',
    top: Spacing.one,
    right: Spacing.one,
    minWidth: Spacing.three + Spacing.half,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.error,
  },
});
