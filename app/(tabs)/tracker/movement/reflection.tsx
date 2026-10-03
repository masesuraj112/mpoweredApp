import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View, TextInput } from 'react-native';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  return (<View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="Reflection on movement"
          prompt={<Text style={styles.promptText}>Write any reflections of pain impacts on your mobility.</Text>}
          questionNumber={7}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/standing')}
          onRecord={() => router.push('/tracker/movement/summary')}
          variant="painTracker"
          cardHeight={scaleHeight(516)}
        >
          <TextInput
            accessibilityLabel="Reflection on your movement"
            multiline
            value={answers.reflection ?? ''}
            onChangeText={value => updateAnswer('reflection', value)}
            placeholder="For instance, when pain occured, you lie down for the whole day"
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
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: scaleWidth(24), paddingTop: scaleHeight(16) },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
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


