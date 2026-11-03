import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

export type TrackingTab = 'chart' | 'history';

type TrackingScreenHeaderProps = {
  activeTab: TrackingTab;
  /** Generates the PDF of the current tab; the chip is disabled when not given. */
  onPrintPdf?: () => void;
  /** Shows a loading indicator on the chip while the PDF is being made. */
  printing?: boolean;
};

const TABS: readonly { id: TrackingTab; label: string; href: '/health/tracking/chart' | '/health/tracking/history' }[] = [
  { id: 'chart', label: 'Chart', href: '/health/tracking/chart' },
  { id: 'history', label: 'History', href: '/health/tracking/history' },
];

/** The tracking records header: Back, the title with a Print PDF action, and the Chart / History tabs. */
export function TrackingScreenHeader({ activeTab, onPrintPdf, printing = false }: TrackingScreenHeaderProps) {
  const printDisabled = !onPrintPdf || printing;

  return (
    <ScreenHeader
      padForStatusBar={false}
      // Back always returns to the start of My Health, however deep in the stack we are.
      onBack={() => router.dismissTo('/health')}>
      <View style={styles.titleRow}>
        <AppText accessibilityRole="header" variant="titleLarge" style={styles.title}>
          My Health Tracking Records
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Print PDF"
          accessibilityState={{ disabled: printDisabled, busy: printing }}
          disabled={printDisabled}
          onPress={onPrintPdf}
          style={[styles.chip, !onPrintPdf && styles.chipDisabled]}>
          {printing ? (
            <ActivityIndicator
              size="small"
              color={Colors.light.onSurfaceVariant}
              accessibilityLabel="Creating PDF"
            />
          ) : (
            <AppText variant="labelMedium" color="onSurfaceVariant">
              Print PDF
            </AppText>
          )}
        </Pressable>
      </View>

      <View accessibilityRole="tablist" style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => !active && router.replace(tab.href)}
              style={[styles.tab, active && styles.tabActive]}>
              <AppText variant="labelLargeBold" color={active ? 'primary' : 'onSurfaceVariant'}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.mid,
  },
  title: {
    flex: 1,
  },
  chip: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.large,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  tab: {
    flex: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.light.primary,
  },
});
