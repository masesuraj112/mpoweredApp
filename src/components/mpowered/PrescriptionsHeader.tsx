import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface PrescriptionsHeaderProps {
  title: string;
  /** Optional label shown on the right of the top bar, e.g. "Homescreen" */
  topBarLabel?: string;
  /** Optional content rendered to the right of the title, e.g. action chips */
  titleAccessory?: ReactNode;
}

const SECONDARY_CONTAINER = '#E8DEF8';
const ON_SURFACE_VARIANT = '#49454F';

export function PrescriptionsHeader({ title, topBarLabel, titleAccessory }: PrescriptionsHeaderProps) {
  return (
    <View>
      <View style={styles.topBar}>
        {/* Back always returns to the start of My Health, however deep in the stack we are */}
        <Pressable style={styles.backRow} hitSlop={8} onPress={() => router.dismissTo('/health')}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        {topBarLabel && <Text style={styles.topBarLabel}>{topBarLabel}</Text>}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleAccessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: SECONDARY_CONTAINER,
    paddingHorizontal: scaleWidth(19),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLabel: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: 'black',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backChevron: {
    fontSize: scaleFont(22),
    color: ON_SURFACE_VARIANT,
    marginRight: scaleWidth(2),
    marginTop: -2,
  },
  backText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: ON_SURFACE_VARIANT,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scaleHeight(20),
    marginHorizontal: scaleWidth(24),
  },
  title: {
    flexShrink: 1,
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: 'black',
  },
});
