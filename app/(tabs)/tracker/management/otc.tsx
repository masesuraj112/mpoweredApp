import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function OtcScreen() {
  const { answers, updateAnswer } = useManagementAssessment();

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Management</Text>
        <ChoiceCard
          title="Medication"
          prompt={<Text style={styles.prompt}>Over the past week, did you consume any over the counter (OTC) medication.</Text>}
          questionNumber={2}
          totalQuestions={4}
          onPrevious={() => router.push('/tracker/management/medication')}
          onRecord={() => router.push('/tracker/management/exercise')}
          variant="management"
          cardHeight={scaleHeight(516)}
        >
          <View style={styles.inputContent}>
            <Text style={styles.helperText}>
              Not taking OTC medications? Just click the record button
            </Text>
            <TextInput
              accessibilityLabel="Over the counter medication name"
              multiline
              value={answers.otcMedication ?? ''}
              onChangeText={value => updateAnswer('otcMedication', value)}
              placeholder="Input name of over the counter medication"
              placeholderTextColor="#B3B3B3"
              textAlignVertical="top"
              style={styles.input}
            />
          </View>
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
  inputContent: {
    gap: scaleHeight(10),
    paddingHorizontal: scaleWidth(4),
  },
  helperText: {
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
