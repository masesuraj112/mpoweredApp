import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GENERAL_IMPACT_OPTIONS } from './general';
import { WALKING_OPTIONS } from './walking';
import { LIFTING_OPTIONS } from './lifting';
import { SITTING_OPTIONS } from './sitting';
import { STANDING_OPTIONS } from './standing';


const EXERCISE_INFO_URL = 'https://muscha.org/exercise';

function scoreOf(options: string[], answer?: string): number {
  if (!answer) return 0;
  const index = options.indexOf(answer);
  return index === -1 ? 0 : index;
}

function impactMessage(score: number): string {
  if (score <= 5) return 'Your answers indicate that pain does not really impact your movement.';
  if (score <= 10) return 'Your answers indicate that pain mildly impacts your movement.';
  if (score <= 15) return 'Your answers indicate that pain moderately impacts your movement.';
  return 'Your answers indicate that pain is significantly impacting your movement. With the right support and treatment, your movement and mobility can improve.';
}

export default function SummaryScreen() {
  const { answers } = useMovementAssessment();

  const generalScore = answers.generalImpacts?.length ?? 0;
  const walkingScore = scoreOf(WALKING_OPTIONS, answers.walkingImpact);
  const liftingScore = scoreOf(LIFTING_OPTIONS, answers.liftingImpact);
  const sittingScore = scoreOf(SITTING_OPTIONS, answers.sittingImpact);
  const standingScore = scoreOf(STANDING_OPTIONS, answers.standingImpact);
  const totalScore = generalScore + walkingScore + liftingScore + sittingScore + standingScore;

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>My Movement</Text>
          {/* TODO: Use the selected assessment's recorded week when submissions include dates. */}
          <Text style={styles.period}>Period: 18-24 May</Text>
        </View>
        <View style={styles.divider} />

        <ScrollView
          style={styles.reportScroll}
          contentContainerStyle={styles.reportContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionHeading}>Summary</Text>
          <View style={styles.guidancePanel}>
            <Text style={styles.guidanceText}>{impactMessage(totalScore)}</Text>
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
              value={
                answers.activeHours !== undefined
                  ? `Last week, I was able to stay active for approximately ${answers.activeHours} hours`
                  : 'No response recorded.'
              }
            />
            <ResultSection
              heading="General Movement:"
              value={
                answers.generalImpacts && answers.generalImpacts.length > 0
                  ? answers.generalImpacts.join(' ')
                  : 'No impacts reported this week.'
              }
            />
            <ResultSection heading="Walking:" value={answers.walkingImpact || 'No response recorded.'} />
            <ResultSection heading="Lifting:" value={answers.liftingImpact || 'No response recorded.'} />
            <ResultSection heading="Sitting:" value={answers.sittingImpact || 'No response recorded.'} />
            <ResultSection heading="Standing:" value={answers.standingImpact || 'No response recorded.'} />
          </View>

          <Text style={styles.resultsHeading}>My reflections:</Text>
          <Text style={styles.reflectionText}>
            {answers.reflection?.trim() || 'No reflection recorded.'}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
            {/* TODO: Persist this report to the Care Journal before showing its saved status. */}
            <Text style={styles.savedText}>Saved to Care Journal</Text>
            <Pressable
              onPress={() => router.replace('/tracker')}
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
});