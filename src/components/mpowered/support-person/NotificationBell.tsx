import { Colors } from '@/constants/theme';
import { scaleFont } from '@/services/scale';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const bellIcon = require('../../../../assets/images/support-person/bell.svg');

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
      <View style={styles.iconBox}>
        <Image source={bellIcon} style={styles.bell} contentFit="contain" accessibilityLabel="" />
      </View>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
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
      hitSlop={10}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 31,
    height: 30,
  },
  pressed: {
    opacity: 0.6,
  },
  iconBox: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bell: {
    width: 17.3333,
    height: 21.125,
  },
  badge: {
    position: 'absolute',
    left: 14,
    top: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: Colors.light.background,
    fontSize: scaleFont(9),
    fontWeight: '700',
    lineHeight: 13.5,
  },
});
