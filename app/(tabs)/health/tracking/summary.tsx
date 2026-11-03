import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { HealthSubpage } from '@/components/health/HealthSubpage';
import { ProfileSectionCard } from '@/components/health/ProfileSectionCard';
import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { formatWeekRange } from '@/features/assessments/week';
import { ASSESSMENT_LABELS, isAssessmentType } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { assessmentSection } from '@/features/health-profile/profile';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { fail } from '@/lib/result';
import { getAssessments } from '@/services/health';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The summary of one assessment for one week, opened from the History tab.
export default function WeekSummaryScreen() {
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
    <HealthSubpage
      header={<ScreenHeader padForStatusBar={false} backLabel="Back to history" onBack={() => router.back()} />}
    >
      <AppText accessibilityRole="header" variant="titleLarge">
        {title}
      </AppText>
      {weekStart && (
        <AppText variant="bodySmall" color="textSecondary" style={styles.period}>
          Period: {formatWeekRange(weekStart)}
        </AppText>
      )}
      <Divider style={styles.divider} />

      {(!type || !weekStart) && <ErrorState message="We could not find the week to show." />}
      {type && weekStart && state.status === 'loading' && <LoadingState label="Loading your summary" />}
      {type && weekStart && state.status === 'error' && (
        <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
      )}
      {section && <ProfileSectionCard section={section} />}
    </HealthSubpage>
  );
}

const styles = StyleSheet.create({
  period: {
    marginTop: Spacing.one,
  },
  divider: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
});
