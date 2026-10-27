import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

export type TrackingTab = 'chart' | 'history';

interface TrackingScreenHeaderProps {
  activeTab: TrackingTab;
  /** Generates the PDF of the current tab; the chip is disabled when not given */
  onPrintPdf?: () => void;
  /** Shows a loading indicator on the chip while the PDF is being made */
  printing?: boolean;
}

const SECONDARY_CONTAINER = '#E8DEF8';
const PRIMARY_PURPLE = '#6750A4';
const ON_SURFACE_VARIANT = '#49454F';
const OUTLINE_VARIANT = '#CAC4D0';

export function TrackingScreenHeader({ activeTab, onPrintPdf, printing = false }: TrackingScreenHeaderProps) {
  return (
    <View>
      <View style={styles.topBar}>
        {/* Back always returns to the start of My Health, however deep in the stack we are */}
        <Pressable
          style={styles.backRow}
          hitSlop={8}
          onPress={() => router.dismissTo('/health')}
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>My Health Tracking Records</Text>
        <Pressable
          style={[styles.printChip, !onPrintPdf && styles.printChipDisabled]}
          onPress={onPrintPdf}
          disabled={!onPrintPdf || printing}
          accessibilityRole="button"
          accessibilityLabel="Print PDF"
          accessibilityState={{ disabled: !onPrintPdf || printing, busy: printing }}
        >
          {printing ? (
            <ActivityIndicator size="small" color={ON_SURFACE_VARIANT} accessibilityLabel="Creating PDF" />
          ) : (
            <Text style={styles.printChipText}>Print PDF</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          style={styles.tab}
          onPress={() => activeTab !== 'chart' && router.replace('/health/tracking/chart')}
        >
          <Text style={[styles.tabText, activeTab === 'chart' && styles.tabTextActive]}>
            Chart
          </Text>
          {activeTab === 'chart' && <View style={styles.tabIndicator} />}
        </Pressable>
        <Pressable
          style={styles.tab}
          onPress={() => activeTab !== 'history' && router.replace('/health/tracking/history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
          {activeTab === 'history' && <View style={styles.tabIndicator} />}
        </Pressable>
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
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(12),
  },
  title: {
    flex: 1,
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: 'black',
  },
  printChip: {
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    borderRadius: scaleWidth(16),
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(6),
    minWidth: scaleWidth(76),
    alignItems: 'center',
  },
  printChipDisabled: {
    opacity: 0.5,
  },
  printChipText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    color: ON_SURFACE_VARIANT,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE_VARIANT,
    marginHorizontal: scaleWidth(24),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleHeight(12),
  },
  tabText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: ON_SURFACE_VARIANT,
  },
  tabTextActive: {
    color: PRIMARY_PURPLE,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '60%',
    backgroundColor: PRIMARY_PURPLE,
    borderRadius: 1,
  },
});
