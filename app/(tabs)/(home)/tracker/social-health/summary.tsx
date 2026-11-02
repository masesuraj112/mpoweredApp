import { TIPS_URL } from '@/constants/socialHealthOptions';

import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';

import {
  toSocialHealthSummary,
  type SocialHealthSummaryData,
} from '@/features/assessments/social-health/summary';

import { getSocialHealthEntryForWeek } from '@/services/social-health';

import { router, useLocalSearchParams } from 'expo-router';

import { useEffect, useState } from 'react';

import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';


import { ContentColumn, Fonts, makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

function SocialHealthSummaryView({ summary, onClose }: { summary: SocialHealthSummaryData; onClose: () => void }) {
  const styles = useStyles();
  const impact = summary.impactPhrase;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        Your answers help your doctor focus on what matters most to your daily life.
      </Text>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>My Social Health</Text>
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
            <Text style={styles.guidanceText}>
              {impact ? (
                <>
                  Your answers indicate that pain <Text style={styles.boldText}>{impact}</Text> your ability to enjoy
                  social activities.
                </>
              ) : (
                'Not enough answers to summarise how pain affects your social activities.'
              )}
              {'\n'}With the right treatment and support, you can stay more active and connected.
            </Text>
            <Pressable
              onPress={() => Linking.openURL(TIPS_URL)}
              accessibilityRole="link"
              accessibilityLabel="Explore tips on managing emotions"
              style={({ pressed }) => [styles.tipsButton, pressed && styles.tipsButtonPressed]}
            >
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.tipsButtonText}>Explore tips on managing emotions</Text>
            </Pressable>
          </View>

          <Text style={styles.resultsHeading}>My results:</Text>
          <View style={styles.resultsList}>
            <ResultSection heading="Social life:" value={summary.results.socialLife} />
            <ResultSection heading="Travelling:" value={summary.results.travelling} />
            <ResultSection heading="Mood:" value={summary.results.mood} />
            <ResultSection heading="Relation with others:" value={summary.results.relationWithOthers} />
            <ResultSection heading="Enjoyment of life:" value={summary.results.enjoymentOfLife} />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionHeading}>My reflections on mood:</Text>
            <View style={[styles.resultsList, styles.reflectionList]}>
              <ResultSection heading="General Mood:" value={summary.generalMood} />
              <ResultSection heading="Triggers:" value={summary.triggers} />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
            <Text style={styles.savedText}>Saved to Care Journal</Text>
            <CloseButton onPress={onClose} />
          </View>
        </View>
      </View>
    </View>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: SocialHealthSummaryData };

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
    getSocialHealthEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: socialHealthSaveMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toSocialHealthSummary(result.data) });
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
    return <SocialHealthSummaryView summary={view.summary} onClose={close} />;
  }

  return (
    <View style={[styles.screen, styles.centered]}>
      {view.status === 'loading' ? (
        <ActivityIndicator accessibilityLabel="Loading your summary" />
      ) : (
        <>
          <Text style={styles.resultText}>{view.message}</Text>
          <CloseButton onPress={close} />
        </>
      )}
    </View>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  const styles = useStyles();
  return (
    <Button
      label="Close"
      variant="outlined"
      onPress={onPress}
      accessibilityLabel="Close summary"
    />
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
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    backgroundColor: colors.surfaceContainer,
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
    backgroundColor: colors.surfaceContainer,
    marginHorizontal: Spacing.one,
  },
  guidanceText: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: colors.text,
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  boldText: {
    color: colors.text,
    fontWeight: '700',
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
  reflectionList: {
    marginTop: Spacing.one,
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
}));
