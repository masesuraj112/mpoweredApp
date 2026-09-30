import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { SAMPLE_PRESCRIPTION_SCRIPTS } from '@/features/health-profile/prescriptions';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const OTHER_MANAGEMENT_OPTION = 'I sit down most of the day because of my pain';
const MEDICATION_OPTIONS = [
  ...SAMPLE_PRESCRIPTION_SCRIPTS.map(script => script.name),
  OTHER_MANAGEMENT_OPTION,
];
const MEDICATION_SUPPORTING_TEXT = [
  ...SAMPLE_PRESCRIPTION_SCRIPTS.map(script => script.frequency),
  undefined,
];

export default function MedicationScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
  const savedMedications = answers.medications ?? [];
  const selected = MEDICATION_OPTIONS.reduce<number[]>((indices, option, index) => {
    if (savedMedications.includes(option)) {
      indices.push(index);
    }
    return indices;
  }, []);

  const handleSelectionChange = (selectedIndices: number[]) => {
    updateAnswer('medications', selectedIndices.map(index => MEDICATION_OPTIONS[index]));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Management</Text>
        <MultiChoiceList
          title="Medication"
          prompt={
            <View style={styles.promptContent}>
              <Text style={styles.promptText}>
                Over the past week, select medications that you consumed to manage your pain.
              </Text>
              <Text style={styles.helperText}>Not taking medications? Just click the record button</Text>
              <Text style={styles.sourceText}>Generated based on your medication scripts</Text>
            </View>
          }
          options={MEDICATION_OPTIONS}
          supportingTexts={MEDICATION_SUPPORTING_TEXT}
          selectedIndices={selected}
          onSelectionChange={handleSelectionChange}
          questionNumber={1}
          totalQuestions={4}
          onRecord={() => router.push('/tracker/management/otc')}
          variant="management"
          searchEnabled={false}
          scrollable
          listHeight={scaleHeight(253)}
          selectedChipsEnabled={false}
          cardHeight={scaleHeight(516)}
        />
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
    gap: scaleHeight(10),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  helperText: {
    color: '#727272',
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
  sourceText: {
    color: '#1A1A1A',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(18),
  },
});
