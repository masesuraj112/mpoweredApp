import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const DAILY_LIVING_TIPS_URL = 'https://muscha.org/living-well-with-a-musculoskeletal-condition';

export default function SummaryScreen() {
  const { answers } = usePersonalCareAssessment();

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportTitle}>My Personal Care</Text>
          <Text style={styles.period}>Period: Last 7 days</Text>
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
              Pain is currently having a <Text style={styles.boldText}>significant impact</Text> on your personal care.
              {'\n'}With the right care and guidance, these tasks can become more manageable over time.
            </Text>
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
              value={answers.generalActivities?.join(', ') || 'No activities selected.'}
            />
            <ResultSection
              heading="Personal care (washing, dressing, etc)"
              value={answers.personalCareLevel || 'No response recorded.'}
            />
            <ResultSection
              heading="Sleeping:"
              value={answers.sleepingLevel || 'No response recorded.'}
            />
          </View>

          <View style={styles.reflectionSection}>
            <Text style={styles.reflectionHeading}>My reflections:</Text>
            <Text style={styles.resultText}>{answers.reflection || 'No reflections added.'}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
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
  screen: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(16),
    backgroundColor: '#FFFFFF',
  },
  heading: {
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(8),
    color: '#000000',
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  subheading: {
    marginHorizontal: scaleWidth(7),
    marginBottom: scaleHeight(20),
    color: '#1D1B20',
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
  },
  reportCard: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: '#AEAEB2',
    borderRadius: scaleWidth(12),
    paddingHorizontal: scaleWidth(18),
    paddingTop: scaleHeight(12),
    paddingBottom: scaleHeight(10),
    backgroundColor: '#FFFFFF',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scaleWidth(10),
    minHeight: scaleHeight(28),
  },
  reportTitle: {
    color: '#000000',
    fontSize: scaleFont(20),
    fontWeight: '700',
    lineHeight: scaleHeight(24),
  },
  period: {
    color: '#1D1B20',
    fontSize: scaleFont(11),
    fontWeight: '600',
    lineHeight: scaleHeight(16),
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#CAC4D0',
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(18),
  },
  reportScroll: {
    flex: 1,
    minHeight: 0,
  },
  reportContent: {
    paddingBottom: scaleHeight(12),
  },
  sectionHeading: {
    marginBottom: scaleHeight(14),
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '600',
    lineHeight: scaleHeight(20),
  },
  guidancePanel: {
    overflow: 'hidden',
    borderRadius: scaleWidth(12),
    backgroundColor: '#F2F2F7',
    marginHorizontal: scaleWidth(4),
  },
  guidanceText: {
    paddingHorizontal: scaleWidth(18),
    paddingVertical: scaleHeight(12),
    color: '#000000',
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
  },
  tipsButton: {
    minHeight: scaleHeight(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleWidth(8),
    paddingHorizontal: scaleWidth(12),
    backgroundColor: '#AEAEB0',
  },
  tipsButtonPressed: {
    opacity: 0.8,
  },
  searchIcon: {
    color: '#1D1B20',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(20),
  },
  tipsButtonText: {
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
  },
  resultsHeading: {
    marginTop: scaleHeight(24),
    marginBottom: scaleHeight(12),
    color: '#1D1B20',
    fontSize: scaleFont(12),
    fontWeight: '600',
    lineHeight: scaleHeight(16),
  },
  resultsList: {
    gap: scaleHeight(12),
    paddingHorizontal: scaleWidth(14),
  },
  resultSection: {
    gap: scaleHeight(2),
  },
  resultLabel: {
    color: '#49454F',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
  },
  resultText: {
    color: '#1D1B20',
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
  },
  reflectionSection: {
    gap: scaleHeight(8),
    marginTop: scaleHeight(18),
  },
  reflectionHeading: {
    color: '#1D1B20',
    fontSize: scaleFont(12),
    fontWeight: '600',
    lineHeight: scaleHeight(16),
  },
  footer: {
    flexShrink: 0,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#CAC4D0',
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(12),
  },
  footerRow: {
    minHeight: scaleHeight(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scaleWidth(12),
  },
  savedText: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
  },
  closeButton: {
    minWidth: scaleWidth(105),
    height: scaleHeight(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(100),
    paddingHorizontal: scaleWidth(16),
  },
  closeButtonPressed: {
    backgroundColor: '#F3EDF7',
  },
  closeButtonText: {
    color: '#49454F',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
  },
});
