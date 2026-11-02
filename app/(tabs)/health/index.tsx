import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PainTrendChart } from '@/components/mpowered/PainTrendChart';
import { ASSESSMENT_TYPES } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { completedCount, formatLongDate, lastUpdated } from '@/features/health-profile/profile';
import { painTrendMessage, toChartPoints, toWeeklyRecords } from '@/features/health-profile/tracking';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { ok, run } from '@/lib/result';
import { getAssessments, getPainEntries } from '@/services/health';

import { ContentColumn, makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { BrandText } from '@/components/brand/BrandText';
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
  const styles = useStyles();
  const { state } = useFocusedQuery(loadOverview);
  const overview = state.status === 'ready' ? state.data : null;

  const updated = overview ? lastUpdated(overview.latest) : null;
  const completed = overview ? completedCount(overview.latest) : 0;
  const trend = overview?.trend ?? [];

  let profileTitle = 'Loading your MPowered Health Profile…';
  let profileUpdated = '';
  if (state.status === 'error') {
    profileTitle = healthLoadMessage(state.error);
  } else if (overview && updated) {
    profileTitle = 'Your MPowered Health Profile has been created';
    profileUpdated = `Updated by ${formatLongDate(updated)} · ${completed} of ${ASSESSMENT_TYPES.length} assessments completed`;
  } else if (overview) {
    profileTitle = 'Your MPowered Health Profile has not been created yet';
    profileUpdated = 'Not updated yet';
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>My Health</Text>
        <View style={styles.divider} />

        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/health/pain-profile')}
        >
          <BrandText style={styles.profileTitle}>{profileTitle}</BrandText>
          {profileUpdated !== '' && <Text style={styles.profileUpdated}>{profileUpdated}</Text>}

          <View style={styles.profileRow}>
            <Image source={painProfileIcon} style={styles.profileIcon} contentFit="contain" />
            <Text style={styles.profileDescription}>
              This pain profile will be generated each time you complete the impact questions.
            </Text>
          </View>

          <View style={styles.openProfileButtonRow}>
            <View style={styles.openProfileButton}>
              <Text style={styles.openProfileButtonText}>Open my pain profile</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.shortcutRow}>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/health/tracking/chart')}
          >
            <Text style={styles.shortcutText}>Check my health tracking records</Text>
          </Pressable>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/health/prescriptions')}
          >
            <Text style={styles.shortcutText}>Check my prescriptions</Text>
          </Pressable>
        </View>

        <View style={styles.trendSection}>
          <View style={styles.trendInsightRow}>
            <BrandText style={styles.trendInsight}>{'New insights for your MPowered plan.'}</BrandText>
          </View>
          <Text style={styles.trendSubtitle}>
            {painTrendMessage(trend) ??
              (trend.length === 1
                ? 'Record your pain again next week to see your trend.'
                : 'Record your pain in the Tracker to see your trend.')}
          </Text>

          {trend.length > 0 && (
            <View style={styles.trendChart}>
              <PainTrendChart data={trend} height={styles.trendChart.height} />
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, styles.actionButtonLeft]}
              onPress={() => router.push('/health/tracking/history')}
            >
              <Text style={styles.actionButtonText}>Pain History</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/planner')}
            >
              <Text style={styles.actionButtonText}>Plan Appointment</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.actionButtonRight]}
              onPress={() => router.push('/health/pain-guide')}
            >
              <Text style={styles.actionButtonText}>Pain Guide</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    ...ContentColumn,
    paddingBottom: Spacing.five,
  },
  pageTitle: {
    ...Typography.title,
    color: colors.text,
    marginTop: Spacing.four,
    marginHorizontal: Spacing.four,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  profileCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.card,
    marginHorizontal: Spacing.four,
    padding: Spacing.three,
  },
  profileTitle: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    color: colors.text,
  },
  profileUpdated: {
    ...Typography.caption,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: Spacing.one,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: Spacing.two,
  },
  profileIcon: {
    width: 37,
    height: 41,
  },
  profileDescription: {
    flex: 1,
    ...Typography.caption,
    color: colors.text,
  },
  openProfileButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.three,
  },
  openProfileButton: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  openProfileButtonText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.card,
    minHeight: 61,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  shortcutText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  trendSection: {
    backgroundColor: colors.background,
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  trendInsight: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.text,
  },
  trendInsightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  trendSubtitle: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
    marginTop: Spacing.two,
  },
  trendChart: {
    width: '100%',
    height: 101,
    marginTop: Spacing.two,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
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
    ...Typography.caption,
    fontWeight: '500',
    color: colors.onPrimary,
    textAlign: 'center',
  },
}));
