import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function MoodTriggerScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
        <ChoiceCard
          title="Mood"
          prompt={<Text style={styles.prompt}>What triggered that mood?</Text>}
          questionNumber={7}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/social-health/mood-emotion')}
          onRecord={() => router.push('/tracker/social-health/summary')}
          variant="personalCare"
          cardHeight={scaleHeight(274)}
        >
          <TextInput
            accessibilityLabel="What triggered that mood?"
            multiline
            value={answers.emotionReflection ?? ''}
            onChangeText={value => updateAnswer('emotionReflection', value)}
            placeholder="i.e: delayed in work due to pain, inability to meet with friends, etc"
            placeholderTextColor="#B5B5B5"
            textAlignVertical="top"
            style={styles.reflectionInput}
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
  prompt: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  reflectionInput: {
    minHeight: scaleHeight(80),
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: scaleWidth(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(10),
    color: '#1D1B20',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
  },
});
