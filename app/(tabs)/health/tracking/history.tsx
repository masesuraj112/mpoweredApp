import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrackingScreenHeader } from '@/components/mpowered/TrackingScreenHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface WeeklyHistoryRecord {
  id: string;
  rangeLabel: string;
  categories: string[];
}

// TODO: replace with a Supabase query once tracking data is wired up, e.g.
// supabase.from('pain_assessment').select('week_start, categories').eq('users_id', userId).order('week_start', { ascending: false })
const FAKE_HISTORY_RECORDS: WeeklyHistoryRecord[] = [
  {
    id: 'w1',
    rangeLabel: '18–24 May 2026',
    categories: ['Pain', 'Movement', 'Personal Care', 'Social Health', 'Management'],
  },
  { id: 'w2', rangeLabel: '11–17 May 2026', categories: ['Pain', 'Movement', 'Personal Care', 'Social Health', 'Management'] },
  { id: 'w3', rangeLabel: '04–10 May 2026', categories: ['Pain', 'Movement', 'Personal Care', 'Social Health', 'Management'] },
  { id: 'w4', rangeLabel: '27 Apr–03 May 2026', categories: ['Pain', 'Movement', 'Personal Care', 'Social Health', 'Management'] },
  { id: 'w5', rangeLabel: '20–26 Apr 2026', categories: ['Pain', 'Movement', 'Personal Care', 'Social Health', 'Management'] },
];

export default function TrackingHistoryScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(FAKE_HISTORY_RECORDS[0]?.id ?? null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <TrackingScreenHeader activeTab="history" />

        <View style={styles.list}>
          {FAKE_HISTORY_RECORDS.map((record, index) => {
            const isExpanded = expandedId === record.id;
            return (
              <View
                key={record.id}
                style={[styles.listItem, index === FAKE_HISTORY_RECORDS.length - 1 && styles.listItemLast]}
              >
                <Pressable
                  style={styles.weekRow}
                  onPress={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <Text style={styles.weekLabel}>{record.rangeLabel}</Text>
                  <Text style={styles.chevron}>{isExpanded ? '⌃' : '⌄'}</Text>
                </Pressable>

                {isExpanded &&
                  record.categories.map((category) => (
                    <Pressable key={category} style={styles.categoryRow}>
                      <Text style={styles.categoryLabel}>{category}</Text>
                      <Text style={styles.categoryChevron}>›</Text>
                    </Pressable>
                  ))}
              </View>
            );
          })}
        </View>
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
  categoryChevron: {
    fontSize: scaleFont(16),
    color: '#79747E',
  },
});
