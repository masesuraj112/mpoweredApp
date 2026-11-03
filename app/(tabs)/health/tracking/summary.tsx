import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
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

import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';
import { BackBarHeader } from '@/components/ui/BackBar';
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
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <BackBarHeader label="Back to history" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
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
    ...ContentColumn,
    paddingBottom: Spacing.five,
  },
  title: {
    ...Typography.display,
    color: colors.text,
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
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
