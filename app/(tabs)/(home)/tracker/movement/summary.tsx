import { assessmentSaveMessage } from '@/features/assessments/messages';
import { toMovementSummary, type MovementSummaryData } from '@/features/assessments/movement/summary';
import { getMovementEntryForWeek } from '@/services/assessments';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ContentColumn, Fonts, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
const EXERCISE_INFO_URL = 'https://muscha.org/exercise';

function MovementSummaryView({ summary, onClose }: { summary: MovementSummaryData; onClose: () => void }) {
  const styles = useStyles();
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
              onPress={onClose}
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
  const styles = useStyles();
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/home');

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
    return <MovementSummaryView summary={view.summary} onClose={close} />;
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
  const styles = useStyles();
  return (
    <View style={styles.resultSection}>
      <Text style={styles.resultLabel}>{heading}</Text>
      <Text style={styles.resultText}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.three, backgroundColor: colors.surface },
  heading: { marginLeft: Spacing.two, marginBottom: Spacing.two, color: colors.text, ...Typography.title },
  subheading: { marginHorizontal: Spacing.two, marginBottom: Spacing.three, color: colors.text, ...Typography.caption, letterSpacing: 0.4 },
  reportCard: { flex: 1, minHeight: 0, borderWidth: 1, borderColor: colors.outline, borderRadius: Radius.card, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.two, backgroundColor: colors.surface },
  reportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, minHeight: 28 },
  reportTitle: { color: colors.text, ...Typography.titleSmall },
  period: { color: colors.text, ...Typography.caption, fontWeight: '600', textAlign: 'right' },
  divider: { height: 1, backgroundColor: colors.divider, marginTop: Spacing.two, marginBottom: Spacing.three },
  reportScroll: { flex: 1, minHeight: 0 },
  reportContent: { ...ContentColumn, paddingBottom: Spacing.three },
  sectionHeading: { marginBottom: Spacing.three, color: colors.text, ...Typography.bodySmall, fontWeight: '600' },
  guidancePanel: { overflow: 'hidden', borderRadius: Radius.card, backgroundColor: colors.surface, marginHorizontal: Spacing.one },
  guidanceText: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, color: colors.text, ...Typography.bodySmall, textAlign: 'center' },
  tipsButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, backgroundColor: colors.divider },
  tipsButtonPressed: { opacity: 0.8 },
  searchIcon: { color: colors.text, ...Typography.titleSmall, fontFamily: Fonts.headingRegular },
  tipsButtonText: { color: colors.text, ...Typography.bodySmall, fontWeight: '500' },
  resultsHeading: { marginTop: Spacing.four, marginBottom: Spacing.two, color: colors.text, ...Typography.caption, fontWeight: '600' },
  resultsList: { gap: Spacing.two, paddingHorizontal: Spacing.three },
  resultSection: { gap: Spacing.half },
  resultLabel: { color: colors.textSecondary, ...Typography.caption },
  resultText: { color: colors.text, ...Typography.bodySmall },
  reflectionText: { marginHorizontal: Spacing.three, color: colors.text, ...Typography.bodySmall },
  footer: { flexShrink: 0 },
  footerDivider: { height: 1, backgroundColor: colors.divider, marginTop: Spacing.two, marginBottom: Spacing.two },
  footerRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  savedText: { color: colors.textSecondary, ...Typography.caption },
  closeButton: { minWidth: 105, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.outline, borderRadius: Radius.control, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, minHeight: MinTapTarget },
  closeButtonPressed: { backgroundColor: colors.surfaceContainer },
  closeButtonText: { color: colors.textSecondary, ...Typography.bodySmall, fontWeight: '500' },
  centered: { justifyContent: 'center', alignItems: 'center', gap: Spacing.three },
  errorText: { color: colors.text, ...Typography.bodySmall, textAlign: 'center' },
}));