import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ChipButton } from '@/components/ui/ChipButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { makeStyles, MinTapTarget, Spacing } from '@/constants/theme';

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

const noop = () => {};

/** The tracking records header: the title in the native header bar, a Print PDF action, and the Chart / History tabs. */
export function TrackingScreenHeader({ activeTab, onPrintPdf, printing = false }: TrackingScreenHeaderProps) {
  const styles = useStyles();
  const printDisabled = !onPrintPdf || printing;

  return (
    <ScreenHeader title="My Health Tracking Records">
      <View style={styles.titleRow}>
        <ChipButton
          label="Print PDF"
          busy={printing}
          busyLabel="Creating PDF"
          disabled={printDisabled}
          onPress={onPrintPdf ?? noop}
        />
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

const useStyles = makeStyles((colors) => ({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.mid,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
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
    borderBottomColor: colors.primary,
  },
}));
