import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSectionCard } from '@/components/mpowered/ProfileSectionCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatWeekRange } from '@/features/assessments/week';
import { ASSESSMENT_LABELS, isAssessmentType } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { assessmentSection } from '@/features/health-profile/profile';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { fail } from '@/lib/result';
import { getAssessments } from '@/services/health';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

import { makeStyles } from '@/constants/theme';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The summary of one assessment for one week, opened from the History tab.
export default function WeekSummaryScreen() {
  const styles = useStyles();
  const params = useLocalSearchParams<{ type?: string; weekStart?: string }>();
  const type = isAssessmentType(params.type) ? params.type : null;
  const weekStart = params.weekStart && ISO_DATE.test(params.weekStart) ? params.weekStart : null;

  const load = useCallback(
    () =>
      weekStart
        ? getAssessments({ kind: 'week', weekStart })
        : Promise.resolve(fail({ code: 'NOT_FOUND' as const, message: 'Missing week.' })),
    [weekStart],
  );
  const { state, reload } = useFocusedQuery(load);

  const section = type && state.status === 'ready' ? assessmentSection(type, state.data[type]) : null;
  const title = type ? `My ${ASSESSMENT_LABELS[type]} Summary` : 'Summary';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable
            style={styles.backRow}
            hitSlop={8}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to history"
          >
            <Text style={styles.backChevron}>‹</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{title}</Text>
        {weekStart && <Text style={styles.period}>Period: {formatWeekRange(weekStart)}</Text>}
        <View style={styles.divider} />

        {(!type || !weekStart) && <ErrorState message="We could not find the week to show." />}
        {type && weekStart && state.status === 'loading' && <LoadingState label="Loading your summary" />}
        {type && weekStart && state.status === 'error' && (
          <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
        )}
        {section && <ProfileSectionCard section={section} />}
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
    paddingBottom: scaleHeight(40),
  },
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
  title: {
    fontSize: scaleFont(22),
    fontWeight: '600',
    color: colors.text,
    marginTop: scaleHeight(20),
    marginHorizontal: scaleWidth(24),
  },
  period: {
    fontSize: scaleFont(12),
    color: colors.textSubtle,
    marginTop: scaleHeight(4),
    marginHorizontal: scaleWidth(24),
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    marginHorizontal: scaleWidth(16),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(26),
  },
}));
