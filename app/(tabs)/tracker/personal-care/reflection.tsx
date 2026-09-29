import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Personal Care</Text>
        <ChoiceCard
          title="Reflection on your personal care"
          prompt={<Text style={styles.prompt}>Write any reflections of pain impacts on your daily life:</Text>}
          questionNumber={4}
          totalQuestions={4}
          onPrevious={() => router.push('/tracker/personal-care/sleeping')}
          onRecord={() => router.push('/tracker/personal-care/summary')}
          variant="personalCare"
          cardHeight={scaleHeight(554)}
        >
          <TextInput
            accessibilityLabel="Reflection on your personal care"
            multiline
            value={answers.reflection ?? ''}
            onChangeText={value => updateAnswer('reflection', value)}
            placeholder="For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable"
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
    color: '#1D1B20',
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
