import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

import { makeStyles, useThemeColors } from '@/constants/theme';
export type TrackingTab = 'chart' | 'history';

interface TrackingScreenHeaderProps {
  activeTab: TrackingTab;
  /** Generates the PDF of the current tab; the chip is disabled when not given */
  onPrintPdf?: () => void;
  /** Shows a loading indicator on the chip while the PDF is being made */
  printing?: boolean;
}


export function TrackingScreenHeader({ activeTab, onPrintPdf, printing = false }: TrackingScreenHeaderProps) {
  const styles = useStyles();
  const colors = useThemeColors();
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
            <ActivityIndicator size="small" color={colors.textSecondary} accessibilityLabel="Creating PDF" />
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

const useStyles = makeStyles((colors) => ({
  topBar: {
    backgroundColor: colors.secondaryContainer,
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
    color: colors.textSecondary,
    marginRight: scaleWidth(2),
    marginTop: -2,
  },
  backText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: colors.textSecondary,
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
    color: colors.text,
  },
  printChip: {
    borderWidth: 1,
    borderColor: colors.outline,
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
    color: colors.textSecondary,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
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
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '60%',
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
}));
