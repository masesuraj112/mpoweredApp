import { assessmentSaveMessage } from '@/features/assessments/messages';
import { toMovementSummary, type MovementSummaryData } from '@/features/assessments/movement/summary';
import { getMovementEntryForWeek } from '@/services/assessments';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EXERCISE_INFO_URL = 'https://muscha.org/exercise';

function MovementSummaryView({ summary }: { summary: MovementSummaryData }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>My Movement</Text>
          <Text style={styles.period}>Period: {summary.period}</Text>
        </View>
        <View style={styles.divider} />

        <ScrollView
          style={styles.reportScroll}
          contentContainerStyle={styles.reportContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Summary</Text>
          <View style={styles.guidancePanel}>
            <Text style={styles.guidanceText}>{summary.message}</Text>
            <Pressable
              onPress={() => Linking.openURL(EXERCISE_INFO_URL)}
              accessibilityRole="link"
              accessibilityLabel="Explore tips on managing movement"
              style={({ pressed }) => [styles.tipsButton, pressed && styles.tipsButtonPressed]}
            >
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.tipsButtonText}>Explore tips on managing movement</Text>
            </Pressable>
          </View>

          <Text style={styles.resultsHeading}>My results:</Text>
          <View style={styles.resultsList}>
            <ResultSection
              heading="Average activity hour:"
              value={`Last week, I was able to stay active for approximately ${summary.activeHours} hours`}
            />
            <ResultSection
              heading="General Movement:"
              value={
                summary.generalImpacts.length > 0
                  ? summary.generalImpacts.join(' ')
                  : 'No impacts reported this week.'
              }
            />
            <ResultSection heading="Walking:" value={summary.walking || 'No response recorded.'} />
            <ResultSection heading="Lifting:" value={summary.lifting || 'No response recorded.'} />
            <ResultSection heading="Sitting:" value={summary.sitting || 'No response recorded.'} />
            <ResultSection heading="Standing:" value={summary.standing || 'No response recorded.'} />
          </View>

          <Text style={styles.resultsHeading}>My reflections:</Text>
          <Text style={styles.reflectionText}>
            {summary.reflection || 'No reflection recorded.'}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
            {/* TODO: Persist this report to the My Health before showing its saved status. */}
            <Text style={styles.savedText}>Saved to My Health</Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close summary"
              style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: MovementSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/(tabs)/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getMovementEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: assessmentSaveMessage(result.error, 'movement') });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toMovementSummary(result.data) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const view: SummaryState = weekStart
    ? state
    : { status: 'error', message: 'We could not find the week to show.' };

  if (view.status === 'ready') {
    return <MovementSummaryView summary={view.summary} />;
  }
  return (
    <View style={[styles.screen, styles.centered]}>
      {view.status === 'loading' ? (
        <ActivityIndicator accessibilityLabel="Loading your summary" />
      ) : (
        <>
          <Text style={styles.errorText}>{view.message}</Text>
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close summary"
            style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function ResultSection({ heading, value }: { heading: string; value: string }) {
  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultLabel}>{heading}</Text>
      <Text style={styles.resultText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: scaleWidth(24), paddingTop: scaleHeight(16), paddingBottom: scaleHeight(16), backgroundColor: '#FFFFFF' },
  heading: { marginLeft: scaleWidth(7), marginBottom: scaleHeight(8), color: '#000000', fontSize: scaleFont(24), fontWeight: '600', lineHeight: scaleHeight(29) },
  subheading: { marginHorizontal: scaleWidth(7), marginBottom: scaleHeight(20), color: '#1D1B20', fontSize: scaleFont(12), lineHeight: scaleHeight(16), letterSpacing: 0.4 },
  reportCard: { flex: 1, minHeight: 0, borderWidth: 1, borderColor: '#AEAEB2', borderRadius: scaleWidth(12), paddingHorizontal: scaleWidth(18), paddingTop: scaleHeight(12), paddingBottom: scaleHeight(10), backgroundColor: '#FFFFFF' },
  reportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: scaleWidth(10), minHeight: scaleHeight(28) },
  reportTitle: { color: '#000000', fontSize: scaleFont(20), fontWeight: '700', lineHeight: scaleHeight(24) },
  period: { color: '#1D1B20', fontSize: scaleFont(11), fontWeight: '600', lineHeight: scaleHeight(16), textAlign: 'right' },
  divider: { height: 1, backgroundColor: '#CAC4D0', marginTop: scaleHeight(8), marginBottom: scaleHeight(18) },
  reportScroll: { flex: 1, minHeight: 0 },
  reportContent: { paddingBottom: scaleHeight(12) },
  sectionHeading: { marginBottom: scaleHeight(14), color: '#1D1B20', fontSize: scaleFont(14), fontWeight: '600', lineHeight: scaleHeight(20) },
  guidancePanel: { overflow: 'hidden', borderRadius: scaleWidth(12), backgroundColor: '#F2F2F7', marginHorizontal: scaleWidth(4) },
  guidanceText: { paddingHorizontal: scaleWidth(18), paddingVertical: scaleHeight(12), color: '#000000', fontSize: scaleFont(14), lineHeight: scaleHeight(20), textAlign: 'center' },
  tipsButton: { minHeight: scaleHeight(44), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scaleWidth(8), paddingHorizontal: scaleWidth(12), backgroundColor: '#AEAEB0' },
  tipsButtonPressed: { opacity: 0.8 },
  searchIcon: { color: '#1D1B20', fontSize: scaleFont(20), lineHeight: scaleFont(20) },
  tipsButtonText: { color: '#1D1B20', fontSize: scaleFont(14), fontWeight: '500', lineHeight: scaleHeight(20) },
  resultsHeading: { marginTop: scaleHeight(24), marginBottom: scaleHeight(12), color: '#1D1B20', fontSize: scaleFont(12), fontWeight: '600', lineHeight: scaleHeight(16) },
  resultsList: { gap: scaleHeight(12), paddingHorizontal: scaleWidth(14) },
  resultSection: { gap: scaleHeight(2) },
  resultLabel: { color: '#49454F', fontSize: scaleFont(12), lineHeight: scaleHeight(16) },
  resultText: { color: '#1D1B20', fontSize: scaleFont(14), lineHeight: scaleHeight(20) },
  reflectionText: { marginHorizontal: scaleWidth(14), color: '#1D1B20', fontSize: scaleFont(14), lineHeight: scaleHeight(20) },
  footer: { flexShrink: 0 },
  footerDivider: { height: 1, backgroundColor: '#CAC4D0', marginTop: scaleHeight(8), marginBottom: scaleHeight(12) },
  footerRow: { minHeight: scaleHeight(34), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: scaleWidth(12) },
  savedText: { color: 'rgba(60, 60, 67, 0.6)', fontSize: scaleFont(12), lineHeight: scaleHeight(16) },
  closeButton: { minWidth: scaleWidth(105), height: scaleHeight(30), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CAC4D0', borderRadius: scaleWidth(100), paddingHorizontal: scaleWidth(16) },
  closeButtonPressed: { backgroundColor: '#F3EDF7' },
  closeButtonText: { color: '#49454F', fontSize: scaleFont(14), fontWeight: '500', lineHeight: scaleHeight(20) },
  centered: { justifyContent: 'center', alignItems: 'center', gap: scaleHeight(16) },
  errorText: { color: '#1D1B20', fontSize: scaleFont(14), lineHeight: scaleHeight(20), textAlign: 'center' },
});