import { ActivityIndicator, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { toPainSummary, type PainSummaryData } from '@/features/assessments/pain/summary';
import { getPainEntryForWeek } from '@/services/assessments';
import { painSaveMessage } from '@/features/assessments/pain/messages';

import { ContentColumn, Fonts, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
interface PainSummaryProps {
  summary: PainSummaryData;
  onClose?: () => void;
}

function PainSummaryView({ summary, onClose }: PainSummaryProps) {
  const styles = useStyles();
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>My Pain</Text>
              <Text style={styles.periodText}>Period: {summary.period}</Text>
            </View>
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Pain location</Text>
            <Text style={styles.bodyText}>I have pain in the following areas:</Text>
            <View style={styles.bulletRow}>
              {summary.locations.map((loc) => (
                <Text key={loc} style={styles.bulletText}>• {loc}</Text>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Pain characteristics</Text>
            <Text style={styles.bodyText}>
              My pain were: <Text style={styles.boldInline}>{summary.characteristics.join(', ')}</Text>
            </Text>

            <Text style={styles.sectionTitle}>Pain intensity</Text>
            <View style={styles.intensityGrid}>
              <IntensityRow label="Current Pain" value={summary.intensity.current.value} description={summary.intensity.current.description} />
              <IntensityRow label="Mildest pain" value={summary.intensity.mildest.value} description={summary.intensity.mildest.description} />
              <IntensityRow label="Worst pain" value={summary.intensity.worst.value} description={summary.intensity.worst.description} />
              <IntensityRow label="Average pain" value={summary.intensity.average.value} description={summary.intensity.average.description} />
            </View>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.footerDivider} />
            <View style={styles.footerRow}>
              <Text style={styles.savedText}>Saved to My Health</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: PainSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function PainSummary() {
  const styles = useStyles();
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getPainEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: painSaveMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toPainSummary(result.data) });
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
    return <PainSummaryView summary={view.summary} onClose={close} />;
  }
  return (
    <View style={[styles.screen, styles.centered]}>
      {view.status === 'loading' ? (
        <ActivityIndicator accessibilityLabel="Loading your summary" />
      ) : (
        <>
          <Text style={styles.bodyText}>{view.message}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={close}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function IntensityRow({ label, value, description }: { label: string; value: number; description: string }) {
  const styles = useStyles();
  return (
    <View style={styles.intensityRow}>
      <Text style={styles.intensityLabel}>{label}: {value}</Text>
      <Text style={styles.bodyText}>{description}</Text>
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
    padding: Spacing.four,
  },
  heading: {
    ...Typography.title,
    marginBottom: Spacing.one,
  },
  subheading: {
    ...Typography.bodySmall,
    color: colors.text,
    marginBottom: Spacing.three,
  },
  card: {
    flex: 1,
    borderRadius: Radius.card,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  cardScrollContent: {
    ...ContentColumn,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.headline,
    fontFamily: Fonts.headingRegular,
  },
  periodText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.text,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    ...Typography.subtitle,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  bodyText: {
    ...Typography.caption,
    color: colors.text,
  },
  bulletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  bulletText: {
    ...Typography.bodySmall,
    fontWeight: 'bold',
    marginTop: Spacing.one,
  },
  boldInline: {
    fontWeight: 'bold',
  },
  intensityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  intensityRow: {
    width: '48%',
    marginTop: Spacing.three,
  },
  intensityLabel: {
    ...Typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: Spacing.one,
  },
  footerContainer: {
    marginTop: Spacing.three,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginBottom: Spacing.three,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedText: {
    color: colors.textSubtle,
    ...Typography.caption,
  },
  closeButton: {
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    minHeight: MinTapTarget,
    backgroundColor: colors.surfaceContainer,
  },
  closeButtonText: {
    ...Typography.bodyLarge,
    fontWeight: '400',
  },
}));