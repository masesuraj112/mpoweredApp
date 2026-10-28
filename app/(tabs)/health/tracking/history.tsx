import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrackingScreenHeader } from '@/components/mpowered/TrackingScreenHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
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
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <TrackingScreenHeader
          activeTab="history"
          onPrintPdf={weeks.length > 0 ? printPdf : undefined}
          printing={pdf.busy !== null}
        />

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
                      <Text style={styles.weekLabel}>{week.rangeLabel}</Text>
                      <Text style={styles.weekCount}>
                        {week.completedCount} of {ASSESSMENT_TYPES.length} completed
                      </Text>
                    </View>
                    <Text style={styles.chevron}>{isExpanded ? '⌃' : '⌄'}</Text>
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
                        <Text
                          style={[styles.categoryLabel, !assessment.completed && styles.categoryLabelMissing]}
                        >
                          {assessment.label}
                        </Text>
                        <View style={styles.statusRow}>
                          <Text
                            style={[
                              styles.status,
                              assessment.completed ? styles.statusDone : styles.statusMissing,
                            ]}
                          >
                            {assessment.completed ? 'Completed' : 'Not completed'}
                          </Text>
                          {assessment.completed && <Text style={styles.categoryChevron}>›</Text>}
                        </View>
                      </Pressable>
                    ))}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY_PURPLE = '#6750A4';
const OUTLINE = '#898A8D';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  list: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE,
    borderRadius: scaleWidth(4),
  },
  listItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OUTLINE,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(16),
  },
  weekLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: PRIMARY_PURPLE,
  },
  chevron: {
    fontSize: scaleFont(16),
    color: '#1D1B20',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingLeft: scaleWidth(32),
    paddingVertical: scaleHeight(14),
  },
  categoryLabel: {
    fontSize: scaleFont(14),
    fontWeight: '400',
    color: 'black',
  },
  categoryLabelMissing: {
    color: '#79747E',
  },
  weekCount: {
    fontSize: scaleFont(12),
    color: '#49454F',
    marginTop: scaleHeight(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(8),
  },
  status: {
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  statusDone: {
    color: '#2E7D32',
  },
  statusMissing: {
    color: '#B3261E',
  },
  categoryChevron: {
    fontSize: scaleFont(16),
    color: '#79747E',
  },
});
