import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function EmotionScreen() {
  const { answers, updateAnswer } = useManagementAssessment();

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Management</Text>
        <ChoiceCard
          title="Emotion"
          prompt={
            <View style={styles.promptContent}>
              <Text style={styles.promptText}>
                Over the past week, did you perform any strategies to manage your stress level or emotion?
              </Text>
              <Text style={styles.examples}>
                Examples: meditation, journaling, meeting people
              </Text>
            </View>
          }
          questionNumber={4}
          totalQuestions={4}
          onPrevious={() => router.push('/tracker/management/exercise')}
          onRecord={() => router.push('/tracker/management/summary')}
          variant="management"
          cardHeight={scaleHeight(516)}
        >
          <TextInput
            accessibilityLabel="Emotion management strategies"
            multiline
            value={answers.emotionStrategies ?? ''}
            onChangeText={value => updateAnswer('emotionStrategies', value)}
            placeholder="Write about any strategies you used to manage your emotions"
            placeholderTextColor="#B3B3B3"
            textAlignVertical="top"
            style={styles.input}
          />
        </ChoiceCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  promptContent: {
    gap: scaleHeight(12),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  examples: {
    color: '#727272',
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
  input: {
    height: scaleHeight(146),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    color: '#1D1B20',
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
  },
});
