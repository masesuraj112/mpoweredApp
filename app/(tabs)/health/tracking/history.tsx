import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HealthSubpage } from '@/components/health/HealthSubpage';
import { TrackingScreenHeader } from '@/components/health/TrackingScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { ChevronDownIcon, ChevronRightIcon } from '@/components/ui/icons';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { ASSESSMENT_TYPES } from '@/features/health-profile/assessment-types';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { buildHistoryHtml } from '@/features/health-profile/pdf-export';
import { formatLongDate } from '@/features/health-profile/profile';
import { toHistoryWeeks, type HistoryAssessment } from '@/features/health-profile/tracking';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { usePdfExport } from '@/hooks/usePdfExport';
import { ok, run } from '@/lib/result';
import { getUserStartWeek } from '@/services/assessments';
import { getCompletedWeeks } from '@/services/health';

function loadHistory() {
  return run(async () => {
    const startWeek = await getUserStartWeek();
    if (!startWeek.ok) return startWeek;
    const currentWeek = getWeekStart(getLocalToday());
    const completed = await getCompletedWeeks(startWeek.data, currentWeek);
    if (!completed.ok) return completed;
    return ok(toHistoryWeeks(startWeek.data, currentWeek, completed.data));
  });
}

export default function TrackingHistoryScreen() {
  const { state, reload } = useFocusedQuery(loadHistory);
  const weeks = state.status === 'ready' ? state.data : [];
  // undefined until the user taps a week, so the newest week starts open
  const [expandedWeek, setExpandedWeek] = useState<string | null | undefined>(undefined);
  const openWeek = expandedWeek === undefined ? (weeks[0]?.weekStart ?? null) : expandedWeek;
  const pdf = usePdfExport();

  const openSummary = (weekStart: string, assessment: HistoryAssessment) => {
    if (!assessment.completed) return;
    router.push({
      pathname: '/health/tracking/summary',
      params: { type: assessment.type, weekStart },
    });
  };

  const printPdf = () =>
    pdf.run('print', () => buildHistoryHtml(weeks, formatLongDate(getLocalToday())));

  return (
    <HealthSubpage
      header={
        <TrackingScreenHeader
          activeTab="history"
          onPrintPdf={weeks.length > 0 ? printPdf : undefined}
          printing={pdf.busy !== null}
        />
      }
    >
      {state.status === 'loading' && <LoadingState label="Loading your history" />}
      {state.status === 'error' && (
        <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
      )}

      {weeks.length > 0 && (
        <View style={styles.list}>
          {weeks.map((week, index) => {
            const isExpanded = openWeek === week.weekStart;
            return (
              <View
                key={week.weekStart}
                style={[styles.listItem, index === weeks.length - 1 && styles.listItemLast]}
              >
                <Pressable
                  style={styles.weekRow}
                  onPress={() => setExpandedWeek(isExpanded ? null : week.weekStart)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  accessibilityLabel={`${week.rangeLabel}, ${week.completedCount} of ${ASSESSMENT_TYPES.length} completed`}
                >
                  <View>
                    <AppText variant="labelLargeBold" color="primary">
                      {week.rangeLabel}
                    </AppText>
                    <AppText variant="bodySmall" color="onSurfaceVariant">
                      {week.completedCount} of {ASSESSMENT_TYPES.length} completed
                    </AppText>
                  </View>
                  <View style={isExpanded ? styles.flipped : undefined}>
                    <ChevronDownIcon />
                  </View>
                </Pressable>

                {isExpanded &&
                  week.assessments.map((assessment) => (
                    <Pressable
                      key={assessment.type}
                      style={styles.categoryRow}
                      onPress={() => openSummary(week.weekStart, assessment)}
                      disabled={!assessment.completed}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !assessment.completed }}
                      accessibilityLabel={`${assessment.label}, ${assessment.completed ? 'completed' : 'not completed'}`}
                    >
                      <AppText
                        variant="bodyMediumRegular"
                        color={assessment.completed ? 'text' : 'textSecondary'}
                      >
                        {assessment.label}
                      </AppText>
                      <View style={styles.statusRow}>
                        <AppText
                          variant="labelMedium"
                          color={assessment.completed ? 'successStrong' : 'error'}
                        >
                          {assessment.completed ? 'Completed' : 'Not completed'}
                        </AppText>
                        {assessment.completed && <ChevronRightIcon color={Colors.light.textSecondary} />}
                      </View>
                    </Pressable>
                  ))}
              </View>
            );
          })}
        </View>
      )}
    </HealthSubpage>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderColor: Colors.light.outlineMedium,
    borderRadius: Radius.small,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineMedium,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  weekRow: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.mid,
  },
  flipped: {
    transform: [{ rotate: '180deg' }],
  },
  categoryRow: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingLeft: Spacing.five,
    paddingRight: Spacing.three,
    paddingVertical: Spacing.mid,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
