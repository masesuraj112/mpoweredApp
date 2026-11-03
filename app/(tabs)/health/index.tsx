import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { PainTrendChart } from '@/components/mpowered/PainTrendChart';
import { ASSESSMENT_TYPES } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { completedCount, formatLongDate, lastUpdated } from '@/features/health-profile/profile';
import { painTrendMessage, toChartPoints, toWeeklyRecords } from '@/features/health-profile/tracking';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { ok, run } from '@/lib/result';
import { getAssessments, getPainEntries } from '@/services/health';

import { BrandScreen, HeroTitle } from '@/components/mpowered/BrandScreen';
import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
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
  const colors = useThemeColors();
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
    <BrandScreen
      hero={
        <>
          <HeroTitle>My Health</HeroTitle>
          {/* The pain profile at a glance, on the gradient. */}
          <BrandText style={styles.profileTitle}>{profileTitle}</BrandText>
          {profileUpdated !== '' && <Text style={styles.profileUpdated}>{profileUpdated}</Text>}
          <View style={styles.profileRow}>
            <Image
              source={painProfileIcon}
              style={styles.profileIcon}
              contentFit="contain"
              tintColor={colors.onBrand}
              accessible={false}
            />
            <Text style={styles.profileDescription}>
              This pain profile will be generated each time you complete the impact questions.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/health/pain-profile')}
            style={({ pressed }) => [styles.openProfileButton, pressed && styles.pressed]}>
            <Text style={styles.openProfileButtonText}>Open my pain profile</Text>
          </Pressable>
        </>
      }>
      <View style={styles.shortcutRow}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.shortcutCard, pressed && styles.pressed]}
          onPress={() => router.push('/health/tracking/chart')}>
          <Text style={styles.shortcutText}>Check my health tracking records</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.shortcutCard, pressed && styles.pressed]}
          onPress={() => router.push('/health/prescriptions')}>
          <Text style={styles.shortcutText}>Check my prescriptions</Text>
        </Pressable>
      </View>

      <View style={styles.trendSection}>
        <BrandText style={styles.trendInsight}>{'New insights for your MPowered plan.'}</BrandText>
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
            accessibilityRole="button"
            style={[styles.actionButton, styles.actionButtonLeft]}
            onPress={() => router.push('/health/tracking/history')}>
            <Text style={styles.actionButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Pain History</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.actionButton}
            onPress={() => router.push('/planner')}>
            <Text style={styles.actionButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Plan Appointment</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[styles.actionButton, styles.actionButtonRight]}
            onPress={() => router.push('/health/pain-guide')}>
            <Text style={styles.actionButtonText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>Pain Guide</Text>
          </Pressable>
        </View>
      </View>
    </BrandScreen>
  );
}


const ACTION_INNER_RADIUS = 6;
const ACTION_OUTER_RADIUS = 16;

const useStyles = makeStyles((colors) => ({
  profileTitle: {
    marginTop: Spacing.two,
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.onBrand,
  },
  profileUpdated: {
    ...Typography.bodySmall,
    color: colors.onBrandMuted,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  profileIcon: {
    width: 37,
    height: 41,
  },
  profileDescription: {
    flex: 1,
    ...Typography.bodySmall,
    color: colors.onBrandMuted,
  },
  // A white pill on the gradient, like the Pain Tracker's buttons but light so it reads on purple.
  openProfileButton: {
    alignSelf: 'flex-start',
    minHeight: MinTapTarget,
    justifyContent: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: colors.surface,
  },
  openProfileButtonText: {
    ...Typography.labelLargeBold,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  shortcutCard: {
    flex: 1,
    minHeight: MinTapTarget + Spacing.three,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  shortcutText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  trendSection: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  trendInsight: {
    ...Typography.titleSmall,
    color: colors.text,
  },
  trendSubtitle: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  trendChart: {
    width: '100%',
    height: 101,
  },
  // Three buttons that read as one unit: small gaps, round outer ends, slightly rounded inner corners.
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  // Each button starts at its label's width and the three share what's left, so "Plan Appointment" gets
  // the room it needs; a label only shrinks (a little) if it still can't fit on one line.
  actionButton: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    minHeight: MinTapTarget,
    borderRadius: ACTION_INNER_RADIUS,
    backgroundColor: colors.primary,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Only the outer ends are rounder; the inner corners match the middle button's.
  actionButtonLeft: {
    borderTopLeftRadius: ACTION_OUTER_RADIUS,
    borderBottomLeftRadius: ACTION_OUTER_RADIUS,
    borderTopRightRadius: ACTION_INNER_RADIUS,
    borderBottomRightRadius: ACTION_INNER_RADIUS,
  },
  actionButtonRight: {
    borderTopLeftRadius: ACTION_INNER_RADIUS,
    borderBottomLeftRadius: ACTION_INNER_RADIUS,
    borderTopRightRadius: ACTION_OUTER_RADIUS,
    borderBottomRightRadius: ACTION_OUTER_RADIUS,
  },
  actionButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.onPrimary,
    textAlign: 'center',
  },
}));
