import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Dropdown } from '@/components/health/Dropdown';
import { HealthSubpage } from '@/components/health/HealthSubpage';
import { PainIntensityChart } from '@/components/health/PainIntensityChart';
import { TrackingScreenHeader } from '@/components/health/TrackingScreenHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
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

const PAGE_SIZE = 5;
const ALL_LOCATIONS = '__all__';
const CHART_HEIGHT = 270;

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError }
  | { status: 'ready' };

export default function TrackingChartScreen() {
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
    <HealthSubpage
      header={
        <TrackingScreenHeader
          activeTab="chart"
          onPrintPdf={loadState.status === 'ready' && records.length > 0 ? printPdf : undefined}
          printing={pdf.busy !== null}
        />
      }
    >
      {loadState.status === 'loading' && <LoadingState label="Loading your tracking records" />}
      {loadState.status === 'error' && (
        <ErrorState message={healthLoadMessage(loadState.error)} onRetry={retry} />
      )}
      {loadState.status === 'ready' && records.length === 0 && (
        <AppText variant="bodyMediumRegular" color="onSurfaceVariant" style={styles.emptyText}>
          You have no pain records yet. Complete the Pain tracker to see your chart here.
        </AppText>
      )}

      {loadState.status === 'ready' && records.length > 0 && (
        <View>
          <View style={styles.cardHeaderRow}>
            <AppText accessibilityRole="header" variant="titleLarge" color="textSecondary">
              Pain Intensity
            </AppText>
            <Dropdown
              value={selectedLocation}
              options={locationOptions}
              onChange={setSelectedLocation}
              accessibilityLabel="Pain location"
              variant="chip"
              style={styles.filterChip}
            />
          </View>

          {chartData.length > 0 ? (
            <PainIntensityChart data={chartData} height={CHART_HEIGHT} />
          ) : (
            <AppText variant="bodyMediumRegular" color="onSurfaceVariant" style={styles.emptyText}>
              No records for this location in the loaded weeks.
            </AppText>
          )}

          <View accessibilityRole="tablist" style={styles.metricRow}>
            {PAIN_METRICS.map((metric) => {
              const isActive = metric.key === selectedMetric;
              return (
                <Pressable
                  key={metric.key}
                  style={[styles.metricButton, isActive && styles.metricButtonActive]}
                  onPress={() => setSelectedMetric(metric.key)}
                  accessibilityRole="tab"
                  accessibilityLabel={metric.label}
                  accessibilityState={{ selected: isActive }}
                >
                  <AppText variant="labelLargeBold" color={isActive ? 'primary' : 'text'}>
                    {metric.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {visibleRecords.length > 0 && (
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.tableDate}>
                  Week
                </AppText>
                <AppText variant="labelMedium" color="onSurfaceVariant" style={styles.tableValue}>
                  {metricLabel} pain
                </AppText>
              </View>
              {visibleRecords.map((record, index) => (
                <View
                  key={record.weekStart}
                  style={[styles.tableRow, index === visibleRecords.length - 1 && styles.tableRowLast]}
                >
                  <AppText variant="bodySmall" color="text" style={styles.tableDate}>
                    {record.rangeLabel}
                  </AppText>
                  <AppText variant="labelMedium" color="text" style={styles.tableValue}>
                    {record[selectedMetric]}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          {hasMore && (
            <View style={styles.seeMore}>
              <Button
                label={loadingMore ? 'Loading…' : 'See more records'}
                variant="tonal"
                disabled={loadingMore}
                onPress={loadMore}
              />
            </View>
          )}
          {loadMoreNotice && (
            <AppText
              accessibilityLiveRegion="polite"
              variant="bodySmall"
              color={loadMoreNotice.isError ? 'error' : 'successStrong'}
              style={styles.notice}
            >
              {loadMoreNotice.text}
            </AppText>
          )}
        </View>
      )}
    </HealthSubpage>
  );
}

const styles = StyleSheet.create({
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  filterChip: {
    flexShrink: 1,
    maxWidth: '55%',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: Spacing.five,
  },
  notice: {
    textAlign: 'center',
    marginTop: Spacing.mid,
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: Radius.extraLarge,
    overflow: 'hidden',
  },
  metricButton: {
    flex: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  metricButtonActive: {
    backgroundColor: Colors.light.primaryContainer,
  },
  table: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    borderRadius: Radius.control,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.mid,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableDate: {
    flex: 1.6,
  },
  tableValue: {
    flex: 1,
    textAlign: 'center',
  },
  seeMore: {
    alignItems: 'center',
    marginTop: Spacing.three,
  },
});
