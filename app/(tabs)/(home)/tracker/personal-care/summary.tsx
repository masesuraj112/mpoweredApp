import { assessmentSaveMessage } from '@/features/assessments/messages';
import {
  toPersonalCareSummary,
  type PersonalCareSummaryData,
} from '@/features/assessments/personal-care/summary';
import { getPersonalCareEntryForWeek } from '@/services/assessments';
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
const DAILY_LIVING_TIPS_URL = 'https://muscha.org/living-well-with-a-musculoskeletal-condition';

const closeToHome = () => router.replace('/home');

function PersonalCareSummaryView({ summary }: { summary: PersonalCareSummaryData }) {
  const styles = useStyles();
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>My Personal Care</Text>
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
              onPress={() => Linking.openURL(DAILY_LIVING_TIPS_URL)}
              accessibilityRole="link"
              accessibilityLabel="Explore tips on daily living"
              style={({ pressed }) => [styles.tipsButton, pressed && styles.tipsButtonPressed]}
            >
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.tipsButtonText}>Explore tips on daily living</Text>
            </Pressable>
          </View>

          <Text style={styles.resultsHeading}>My results:</Text>
          <View style={styles.resultsList}>
            <ResultSection
              heading="General Activities:"
              value={summary.generalActivities.join(', ') || 'No activities selected.'}
            />
            <ResultSection
              heading="Personal care (washing, dressing, etc)"
              value={summary.personalCareLevel || 'No response recorded.'}
            />
            <ResultSection
              heading="Sleeping:"
              value={summary.sleepingLevel || 'No response recorded.'}
            />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionHeading}>My reflections:</Text>
            <Text style={[styles.resultText, styles.reflectionText]}>
              {summary.reflection || 'No reflections added.'}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
            <Text style={styles.savedText}>Saved to Care Journal</Text>
            <Pressable
              onPress={closeToHome}
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
  | { status: 'ready'; summary: PersonalCareSummaryData };

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
    getPersonalCareEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: assessmentSaveMessage(result.error, 'personal care') });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toPersonalCareSummary(result.data) });
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
    return <PersonalCareSummaryView summary={view.summary} />;
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  errorText: {
    color: colors.text,
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    backgroundColor: colors.surface,
  },
  heading: {
    marginLeft: Spacing.two,
    marginBottom: Spacing.two,
    color: colors.text,
    ...Typography.title,
  },
  subheading: {
    marginHorizontal: Spacing.two,
    marginBottom: Spacing.three,
    color: colors.text,
    ...Typography.bodySmall,
  },
  reportCard: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    backgroundColor: colors.surface,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    minHeight: 28,
  },
  reportTitle: {
    color: colors.text,
    ...Typography.titleSmall,
  },
  period: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  reportScroll: {
    flex: 1,
    minHeight: 0,
  },
  reportContent: {
    ...ContentColumn,
    paddingBottom: Spacing.three,
  },
  sectionHeading: {
    marginBottom: Spacing.three,
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  guidancePanel: {
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
    marginHorizontal: Spacing.one,
  },
  guidanceText: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: colors.text,
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  tipsButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.divider,
  },
  tipsButtonPressed: {
    opacity: 0.8,
  },
  searchIcon: {
    color: colors.text,
    ...Typography.titleSmall,
    fontFamily: Fonts.headingRegular,
  },
  tipsButtonText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  resultsHeading: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    color: colors.text,
    ...Typography.caption,
    fontWeight: '600',
  },
  resultsList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  resultSection: {
    gap: Spacing.half,
  },
  resultLabel: {
    color: colors.textSecondary,
    ...Typography.caption,
  },
  resultText: {
    color: colors.text,
    ...Typography.bodySmall,
  },
  reflectionSection: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  reflectionHeading: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '600',
  },
  reflectionText: {
    paddingLeft: Spacing.three,
  },
  footer: {
    flexShrink: 0,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  footerRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  savedText: {
    color: colors.textSecondary,
    ...Typography.caption,
  },
  closeButton: {
    minWidth: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    minHeight: MinTapTarget,
  },
  closeButtonPressed: {
    backgroundColor: colors.surfaceContainer,
  },
  closeButtonText: {
    color: colors.textSecondary,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
}));
