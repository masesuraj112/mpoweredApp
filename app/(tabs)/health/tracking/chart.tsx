import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PainIntensityChart } from '@/components/mpowered/PainIntensityChart';
import { TrackingScreenHeader } from '@/components/mpowered/TrackingScreenHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

type PainMetric = 'average' | 'highest' | 'lowest';

interface WeeklyPainRecord {
  id: string;
  rangeLabel: string;
  chartLabel: string;
  average: number;
  highest: number;
  lowest: number;
}

// TODO: replace with a Supabase query once tracking data is wired up, e.g.
// supabase.from('pain_assessment').select('week_start, average_pain_level, highest_pain_level, lowest_pain_level')
//   .eq('users_id', userId).order('week_start', { ascending: false })
const FAKE_WEEKLY_RECORDS: WeeklyPainRecord[] = [
  { id: 'w1', rangeLabel: '18–24 May 2026', chartLabel: '24/05', average: 7, highest: 9, lowest: 6 },
  { id: 'w2', rangeLabel: '11–17 May 2026', chartLabel: '17/05', average: 8, highest: 9, lowest: 6 },
  { id: 'w3', rangeLabel: '04–10 May 2026', chartLabel: '10/05', average: 8, highest: 9, lowest: 7 },
  { id: 'w4', rangeLabel: '27 Apr–03 May 2026', chartLabel: '03/05', average: 7, highest: 8, lowest: 5 },
  { id: 'w5', rangeLabel: '20–26 Apr 2026', chartLabel: '26/04', average: 5, highest: 7, lowest: 3 },
  { id: 'w6', rangeLabel: '13–19 Apr 2026', chartLabel: '19/04', average: 5, highest: 7, lowest: 3 },
  { id: 'w7', rangeLabel: '06–12 Apr 2026', chartLabel: '12/04', average: 5, highest: 7, lowest: 3 },
  { id: 'w8', rangeLabel: '30 Mar–05 Apr 2026', chartLabel: '05/04', average: 4, highest: 6, lowest: 2 },
];

const VISIBLE_RECORDS_COUNT = 5;

const METRICS: { key: PainMetric; label: string }[] = [
  { key: 'average', label: 'Average' },
  { key: 'highest', label: 'Highest' },
  { key: 'lowest', label: 'Lowest' },
];

export default function TrackingChartScreen() {
  const [selectedMetric, setSelectedMetric] = useState<PainMetric>('average');
  const [showAllRecords, setShowAllRecords] = useState(false);

  const chartData = [...FAKE_WEEKLY_RECORDS]
    .reverse()
    .map((record) => ({ label: record.chartLabel, value: record[selectedMetric] }));

  const visibleRecords = showAllRecords
    ? FAKE_WEEKLY_RECORDS
    : FAKE_WEEKLY_RECORDS.slice(0, VISIBLE_RECORDS_COUNT);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <TrackingScreenHeader activeTab="chart" />

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Pain Intensity</Text>
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Back, Knee ▾</Text>
            </View>
          </View>

          <PainIntensityChart data={chartData} height={scaleHeight(270)} />

          <View style={styles.metricRow}>
            {METRICS.map((metric) => {
              const isActive = metric.key === selectedMetric;
              return (
                <Pressable
                  key={metric.key}
                  style={[styles.metricButton, isActive && styles.metricButtonActive]}
                  onPress={() => setSelectedMetric(metric.key)}
                >
                  <Text style={[styles.metricButtonText, isActive && styles.metricButtonTextActive]}>
                    {metric.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.table}>
            {visibleRecords.map((record, index) => (
              <View
                key={record.id}
                style={[styles.tableRow, index === visibleRecords.length - 1 && styles.tableRowLast]}
              >
                <Text style={styles.tableDate}>{record.rangeLabel}</Text>
                <Text style={styles.tableValue}>{record.average}</Text>
                <Text style={styles.tableValue}>{record.highest}</Text>
                <Text style={styles.tableValue}>{record.lowest}</Text>
              </View>
            ))}
          </View>

          {!showAllRecords && FAKE_WEEKLY_RECORDS.length > VISIBLE_RECORDS_COUNT && (
            <Pressable style={styles.seeMoreButton} onPress={() => setShowAllRecords(true)}>
              <Text style={styles.seeMoreButtonText}>See more records</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY_PURPLE = '#6750A4';
const PRIMARY_CONTAINER = '#EADDFF';
const OUTLINE_VARIANT = '#CAC4D0';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  card: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(20),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: '#525252',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    borderRadius: scaleWidth(100),
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(6),
    backgroundColor: '#F5F5F5',
  },
  filterChipText: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: '#49454F',
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: scaleHeight(16),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(20),
    overflow: 'hidden',
  },
  metricButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleHeight(8),
    backgroundColor: 'white',
  },
  metricButtonActive: {
    backgroundColor: PRIMARY_CONTAINER,
  },
  metricButtonText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: 'black',
  },
  metricButtonTextActive: {
    color: PRIMARY_PURPLE,
  },
  table: {
    marginTop: scaleHeight(16),
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: scaleWidth(10),
    paddingHorizontal: scaleWidth(12),
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: scaleWidth(8),
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableDate: {
    flex: 1.6,
    fontSize: scaleFont(12),
    color: 'black',
  },
  tableValue: {
    flex: 1,
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  seeMoreButton: {
    alignSelf: 'center',
    marginTop: scaleHeight(16),
    backgroundColor: '#F2F2F7',
    borderRadius: scaleWidth(12),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(10),
  },
  seeMoreButtonText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    color: 'black',
  },
});
