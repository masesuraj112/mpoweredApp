import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { PainTrendChart } from '@/components/health/PainTrendChart';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { Colors, Elevation, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { ASSESSMENT_TYPES } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { completedCount, formatLongDate, lastUpdated } from '@/features/health-profile/profile';
import { painTrendMessage, toChartPoints, toWeeklyRecords } from '@/features/health-profile/tracking';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { ok, run } from '@/lib/result';
import { getAssessments, getPainEntries } from '@/services/health';

const painProfileIcon = require('../../../assets/images/health/pain-profile-icon.png');

const TREND_WEEKS = 6;

function loadOverview() {
  return run(async () => {
    const [latest, pain] = await Promise.all([
      getAssessments({ kind: 'latest' }),
      getPainEntries({ limit: TREND_WEEKS }),
    ]);
    if (!latest.ok) return latest;
    if (!pain.ok) return pain;
    return ok({ latest: latest.data, trend: toChartPoints(toWeeklyRecords(pain.data), 'average') });
  });
}

export default function HealthScreen() {
  const { state } = useFocusedQuery(loadOverview);
  const overview = state.status === 'ready' ? state.data : null;

  const updated = overview ? lastUpdated(overview.latest) : null;
  const completed = overview ? completedCount(overview.latest) : 0;
  const trend = overview?.trend ?? [];

  let profileTitle = 'Loading your Mpowered Health Profile…';
  let profileUpdated = '';
  if (state.status === 'error') {
    profileTitle = healthLoadMessage(state.error);
  } else if (overview && updated) {
    profileTitle = 'Your Mpowered Health Profile has been created';
    profileUpdated = `Updated by ${formatLongDate(updated)} · ${completed} of ${ASSESSMENT_TYPES.length} assessments completed`;
  } else if (overview) {
    profileTitle = 'Your Mpowered Health Profile has not been created yet';
    profileUpdated = 'Not updated yet';
  }

  return (
    <Screen>
      <AppText accessibilityRole="header" variant="headlineSmall">
        My Health
      </AppText>
      <Divider style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={profileTitle}
        accessibilityHint="Opens your pain profile"
        style={styles.profileCard}
        onPress={() => router.push('/health/pain-profile')}
      >
        <AppText variant="titleMedium">{profileTitle}</AppText>
        {profileUpdated !== '' && (
          <AppText variant="labelSmall" color="textTertiary" style={styles.profileUpdated}>
            {profileUpdated}
          </AppText>
        )}

        <View style={styles.profileRow}>
          <Image source={painProfileIcon} style={styles.profileIcon} contentFit="contain" />
          <AppText variant="bodySmall" color="onSurface" style={styles.profileDescription}>
            This pain profile will be generated each time you complete the impact questions :)
          </AppText>
        </View>

        <View style={styles.openProfileRow}>
          <View style={styles.openProfileButton}>
            <AppText variant="labelLarge">Open my pain profile</AppText>
          </View>
        </View>
      </Pressable>

      <View style={styles.shortcutRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check my health tracking records"
          style={styles.shortcutCard}
          onPress={() => router.push('/health/tracking/chart')}
        >
          <AppText variant="labelLargeBold" color="onSurface" style={styles.shortcutText}>
            Check my health tracking records
          </AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check my prescriptions"
          style={styles.shortcutCard}
          onPress={() => router.push('/health/prescriptions')}
        >
          <AppText variant="labelLargeBold" color="onSurface" style={styles.shortcutText}>
            Check my prescriptions
          </AppText>
        </Pressable>
      </View>

      <View style={styles.trendSection}>
        <View accessible accessibilityLabel="New insights for your Mpowered plan" style={styles.trendInsightRow}>
          <AppText variant="titleMedium" style={styles.italic}>
            New insights for your M
          </AppText>
          <AppText variant="labelSmall" style={styles.italic}>
            powered
          </AppText>
          <AppText variant="titleMedium" style={styles.italic}>
            {' '}
            plan.
          </AppText>
        </View>
        <AppText variant="bodyMedium" color="onSurface" style={styles.trendSubtitle}>
          {painTrendMessage(trend) ??
            (trend.length === 1
              ? 'Record your pain again next week to see your trend.'
              : 'Record your pain in the Tracker to see your trend.')}
        </AppText>

        {trend.length > 0 && (
          <View style={styles.trendChart}>
            <PainTrendChart data={trend} height={TREND_CHART_HEIGHT} />
          </View>
        )}

        <View style={styles.actionRow}>
          <ActionButton label="Pain History" position="left" onPress={() => router.push('/health/tracking/history')} />
          <ActionButton label="Plan Appointment" onPress={() => router.push('/planner')} />
          <ActionButton label="Pain Guide" position="right" onPress={() => router.push('/health/pain-guide')} />
        </View>
      </View>
    </Screen>
  );
}

const TREND_CHART_HEIGHT = 100;
const PROFILE_ICON_WIDTH = 36;
const PROFILE_ICON_HEIGHT = 40;

type ActionButtonProps = {
  label: string;
  /** The ends of the row have rounded outer corners. */
  position?: 'left' | 'right';
  onPress: () => void;
};

/** One segment of the three-button row under the pain trend. */
function ActionButton({ label, position, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        styles.actionButton,
        position === 'left' && styles.actionButtonLeft,
        position === 'right' && styles.actionButtonRight,
      ]}
    >
      <AppText variant="labelMedium" color="onPrimary" style={styles.actionButtonText}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  profileCard: {
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  profileUpdated: {
    marginTop: Spacing.one,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.mid,
    marginTop: Spacing.three,
  },
  profileIcon: {
    width: PROFILE_ICON_WIDTH,
    height: PROFILE_ICON_HEIGHT,
  },
  profileDescription: {
    flex: 1,
  },
  openProfileRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.three,
  },
  openProfileButton: {
    paddingVertical: Spacing.mid,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.background,
    ...Elevation.level1,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  shortcutCard: {
    flex: 1,
    minHeight: MinTapTarget + Spacing.mid,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  shortcutText: {
    textAlign: 'center',
  },
  trendSection: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  trendInsightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  italic: {
    fontStyle: 'italic',
  },
  trendSubtitle: {
    marginTop: Spacing.mid,
  },
  trendChart: {
    width: '100%',
    marginTop: Spacing.mid,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.mid,
    paddingHorizontal: Spacing.two,
    borderWidth: 0.5,
    borderColor: Colors.light.divider,
    backgroundColor: Colors.light.primary,
  },
  actionButtonLeft: {
    borderTopLeftRadius: Radius.control,
    borderBottomLeftRadius: Radius.control,
  },
  actionButtonRight: {
    borderTopRightRadius: Radius.control,
    borderBottomRightRadius: Radius.control,
  },
  actionButtonText: {
    textAlign: 'center',
  },
});
