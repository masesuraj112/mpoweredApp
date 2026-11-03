import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ProfileSectionCard } from '@/components/health/ProfileSectionCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatWeekRange } from '@/features/assessments/week';
import { ASSESSMENT_LABELS, isAssessmentType } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { assessmentSection } from '@/features/health-profile/profile';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { fail } from '@/lib/result';
import { getAssessments } from '@/services/health';

import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';
import { ScreenTitle } from '@/components/ui/nativeHeader';
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
    <>
      <ScreenTitle title={title} />
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        {weekStart && <Text style={styles.period}>Period: {formatWeekRange(weekStart)}</Text>}
        <View style={styles.divider} />

        {(!type || !weekStart) && <ErrorState message="We could not find the week to show." />}
        {type && weekStart && state.status === 'loading' && <LoadingState label="Loading your summary" />}
        {type && weekStart && state.status === 'error' && (
          <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
        )}
        {section && <ProfileSectionCard section={section} />}
      </ScrollView>
    </>
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
  period: {
    ...Typography.caption,
    color: colors.textSubtle,
    marginTop: Spacing.one,
    marginHorizontal: Spacing.four,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
}));
