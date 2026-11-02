import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
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
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View>
      {/* The bar's colour runs up behind the status bar to the top of the screen. */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
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
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backChevron: {
    ...Typography.title,
    color: colors.textSecondary,
    marginRight: Spacing.half,
    marginTop: -Spacing.half,
  },
  backText: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  title: {
    flex: 1,
    ...Typography.display,
    color: colors.text,
  },
  printChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minWidth: 76,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  printChipDisabled: {
    opacity: 0.5,
  },
  printChipText: {
    ...Typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    marginHorizontal: Spacing.four,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  tabText: {
    ...Typography.bodySmall,
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
