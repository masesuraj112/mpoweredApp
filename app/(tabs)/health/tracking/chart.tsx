import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from '@/components/mpowered/Dropdown';
import { PainIntensityChart } from '@/components/mpowered/PainIntensityChart';
import { TrackingScreenHeader } from '@/components/mpowered/TrackingScreenHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getLocalToday } from '@/features/assessments/week';
import { healthLoadMessage } from '@/features/health-profile/messages';
import { buildTrackingChartHtml } from '@/features/health-profile/pdf-export';
import { formatLongDate } from '@/features/health-profile/profile';
import {
  PAIN_METRICS,
  filterByLocation,
  loadMoreMessage,
  painLocations,
  toChartPoints,
  toWeeklyRecords,
  type PainMetric,
  type WeeklyPainRecord,
} from '@/features/health-profile/tracking';
import { usePdfExport } from '@/hooks/usePdfExport';
import type { AppError } from '@/lib/errors';
import { getPainEntries } from '@/services/health';

import { ContentColumn, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
const PAGE_SIZE = 5;
const ALL_LOCATIONS = '__all__';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready' };

export default function TrackingChartScreen() {
  const styles = useStyles();
  const [selectedMetric, setSelectedMetric] = useState<PainMetric>('average');
  const [selectedLocation, setSelectedLocation] = useState<string>(ALL_LOCATIONS);
  const [records, setRecords] = useState<WeeklyPainRecord[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreNotice, setLoadMoreNotice] = useState<{ text: string; isError: boolean } | null>(null);
  const pdf = usePdfExport();

  const fetchFirstPage = (isCancelled: () => boolean = () => false) =>
    getPainEntries({ limit: PAGE_SIZE }).then((result) => {
      if (isCancelled()) return;
      if (!result.ok) return setLoadState({ status: 'error', error: result.error });
      setRecords(toWeeklyRecords(result.data));
      setHasMore(result.data.length === PAGE_SIZE);
      setLoadState({ status: 'ready' });
    });

  const retry = () => {
    setLoadState({ status: 'loading' });
    fetchFirstPage();
  };

  // Loads once on mount; "See more records" loads the older pages.
  useEffect(() => {
    let cancelled = false;
    fetchFirstPage(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  const loadMore = async () => {
    const oldest = records[records.length - 1];
    if (!oldest || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreNotice(null);
    const result = await getPainEntries({ limit: PAGE_SIZE, beforeWeek: oldest.weekStart });
    setLoadingMore(false);
    if (!result.ok) {
      setLoadMoreNotice({ text: healthLoadMessage(result.error), isError: true });
      return;
    }
    setRecords((current) => [...current, ...toWeeklyRecords(result.data)]);
    setHasMore(result.data.length === PAGE_SIZE);
    setLoadMoreNotice({ text: loadMoreMessage(result.data.length), isError: false });
  };

  const locations = painLocations(records);
  const location = selectedLocation === ALL_LOCATIONS ? null : selectedLocation;
  const visibleRecords = filterByLocation(records, location);
  const chartData = toChartPoints(visibleRecords, selectedMetric);
  const metricLabel = PAIN_METRICS.find((m) => m.key === selectedMetric)?.label ?? '';
  const locationOptions = [
    { value: ALL_LOCATIONS, label: 'All locations' },
    ...locations.map((value) => ({ value, label: value })),
  ];

  const printPdf = () =>
    pdf.run('print', () =>
      buildTrackingChartHtml({
        records: visibleRecords,
        points: chartData,
        metric: selectedMetric,
        metricLabel,
        location,
        generated: formatLongDate(getLocalToday()),
      }),
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic">
        <TrackingScreenHeader
          activeTab="chart"
          onPrintPdf={loadState.status === 'ready' && records.length > 0 ? printPdf : undefined}
          printing={pdf.busy !== null}
        />

        {loadState.status === 'loading' && <LoadingState label="Loading your tracking records" />}
        {loadState.status === 'error' && (
          <ErrorState message={healthLoadMessage(loadState.error)} onRetry={retry} />
        )}
        {loadState.status === 'ready' && records.length === 0 && (
          <Text style={styles.emptyText}>
            You have no pain records yet. Complete the Pain tracker to see your chart here.
          </Text>
        )}

        {loadState.status === 'ready' && records.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Pain Intensity</Text>
              <Dropdown
                value={selectedLocation}
                options={locationOptions}
                onChange={setSelectedLocation}
                accessibilityLabel="Pain location"
                style={styles.filterChip}
              />
            </View>

            {chartData.length > 0 ? (
              <PainIntensityChart data={chartData} height={270} />
            ) : (
              <Text style={styles.emptyText}>No records for this location in the loaded weeks.</Text>
            )}

            <View style={styles.metricRow}>
              {PAIN_METRICS.map((metric) => {
                const isActive = metric.key === selectedMetric;
                return (
                  <Pressable
                    key={metric.key}
                    style={[styles.metricButton, isActive && styles.metricButtonActive]}
                    onPress={() => setSelectedMetric(metric.key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text style={[styles.metricButtonText, isActive && styles.metricButtonTextActive]}>
                      {metric.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {visibleRecords.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableDate, styles.tableHeader]}>Week</Text>
                  <Text style={[styles.tableValue, styles.tableHeader]}>{metricLabel} pain</Text>
                </View>
                {visibleRecords.map((record, index) => (
                  <View
                    key={record.weekStart}
                    style={[styles.tableRow, index === visibleRecords.length - 1 && styles.tableRowLast]}
                  >
                    <Text style={styles.tableDate}>{record.rangeLabel}</Text>
                    <Text style={styles.tableValue}>{record[selectedMetric]}</Text>
                  </View>
                ))}
              </View>
            )}

            {hasMore && (
              <Pressable
                style={styles.seeMoreButton}
                onPress={loadMore}
                disabled={loadingMore}
                accessibilityRole="button"
                accessibilityState={{ busy: loadingMore }}
              >
                <Text style={styles.seeMoreButtonText}>
                  {loadingMore ? 'Loading…' : 'See more records'}
                </Text>
              </Pressable>
            )}
            {loadMoreNotice && (
              <Text
                style={[styles.notice, loadMoreNotice.isError && styles.noticeError]}
                accessibilityLiveRegion="polite"
              >
                {loadMoreNotice.text}
              </Text>
            )}
          </View>
        )}
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
  card: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...Typography.titleSmall,
    color: colors.textSecondary,
  },
  filterChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: colors.surfaceContainer,
    maxWidth: '55%',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: Spacing.four,
    marginVertical: Spacing.five,
  },
  tableHeader: {
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notice: {
    ...Typography.caption,
    color: colors.success,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  noticeError: {
    color: colors.error,
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  metricButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    backgroundColor: colors.surface,
  },
  metricButtonActive: {
    backgroundColor: colors.secondaryContainer,
  },
  metricButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  metricButtonTextActive: {
    color: colors.primary,
  },
  table: {
    marginTop: Spacing.three,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: Spacing.two,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableDate: {
    flex: 1.6,
    ...Typography.caption,
    color: colors.text,
  },
  tableValue: {
    flex: 1,
    ...Typography.caption,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  seeMoreButton: {
    marginTop: Spacing.three,
    backgroundColor: colors.background,
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  seeMoreButtonText: {
    ...Typography.caption,
    fontWeight: '500',
    color: colors.text,
  },
}));
