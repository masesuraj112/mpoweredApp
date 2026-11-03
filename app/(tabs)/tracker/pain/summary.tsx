import { IntensityRow } from '@/components/tracker/IntensityRow';
import { ReportSection } from '@/components/tracker/ReportSection';
import { SummaryReport } from '@/components/tracker/SummaryReport';
import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { AppText } from '@/components/ui/AppText';
import { painSaveMessage } from '@/features/assessments/pain/messages';
import { toPainSummary } from '@/features/assessments/pain/summary';
import { useWeekSummary } from '@/features/assessments/useWeekSummary';
import { getPainEntryForWeek } from '@/services/assessments';
import { Spacing } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function PainSummary() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const state = useWeekSummary({
    weekStart,
    load: getPainEntryForWeek,
    toSummary: toPainSummary,
    errorMessage: painSaveMessage,
  });
  const close = () => router.replace('/(tabs)/home');

  if (state.status !== 'ready') return <SummaryStatus state={state} onClose={close} />;

  const { summary } = state;
  const { current, mildest, worst, average } = summary.intensity;
  return (
    <SummaryReport
      title="My Pain"
      period={summary.period}
      intro="This helps guide your treatment and support your recovery."
      savedText="Saved to My Health"
      onClose={close}>
      <ReportSection heading="Pain location">
        <AppText variant="bodyMediumRegular" color="onSurface">
          I have pain in the following areas:
        </AppText>
        <View style={styles.locations}>
          {summary.locations.map((location) => (
            <AppText key={location} variant="labelLargeBold" color="onSurface">
              • {location}
            </AppText>
          ))}
        </View>
      </ReportSection>

      <ReportSection heading="Pain characteristics">
        <AppText variant="bodyMediumRegular" color="onSurface">
          My pain were:{' '}
          <AppText variant="labelLargeBold" color="onSurface">
            {summary.characteristics.join(', ')}
          </AppText>
        </AppText>
      </ReportSection>

      <ReportSection heading="Pain intensity">
        <View style={styles.intensityGrid}>
          <IntensityRow label="Current Pain" value={current.value} description={current.description} />
          <IntensityRow label="Mildest pain" value={mildest.value} description={mildest.description} />
          <IntensityRow label="Worst pain" value={worst.value} description={worst.description} />
          <IntensityRow label="Average pain" value={average.value} description={average.description} />
        </View>
      </ReportSection>
    </SummaryReport>
  );
}

const styles = StyleSheet.create({
  locations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  intensityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.mid,
  },
});
