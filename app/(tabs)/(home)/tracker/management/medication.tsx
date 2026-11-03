import { QuestionPrompt, QuestionHint } from '@/components/mpowered/ChoiceCard';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { NO_MEDICATION_OPTION } from '@/constants/managementOptions';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { toggleMedicationOption } from '@/features/assessments/management/medication';
import { SAMPLE_PRESCRIPTION_SCRIPTS } from '@/features/health-profile/prescriptions';
import { router } from 'expo-router';

// TODO: List the user's own prescriptions once the prescriptions backend exists (M5).
const MEDICATION_OPTIONS = [
  ...SAMPLE_PRESCRIPTION_SCRIPTS.map(script => script.name),
  NO_MEDICATION_OPTION,
];
const MEDICATION_SUPPORTING_TEXT = [
  ...SAMPLE_PRESCRIPTION_SCRIPTS.map(script => script.frequency),
  undefined,
];

export default function MedicationScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
  const savedMedications = answers.medications ?? [];
  const noMedication = answers.noMedication === true;
  const selected = MEDICATION_OPTIONS.reduce<number[]>((indices, option, index) => {
    const isTicked = option === NO_MEDICATION_OPTION ? noMedication : savedMedications.includes(option);
    if (isTicked) {
      indices.push(index);
    }
    return indices;
  }, []);

  // "I didn't take any medication" and the medications exclude each other, so the screen applies
  // the rule itself instead of the list's default toggle.
  const handleOptionPress = (index: number) => {
    const next = toggleMedicationOption(
      { medications: savedMedications, noMedication },
      MEDICATION_OPTIONS[index],
    );
    updateAnswer('medications', next.medications);
    updateAnswer('noMedication', next.noMedication);
    return true;
  };

  return (
    <AssessmentScreen title="My Management">
      <MultiChoiceList
        title="Medication"
        prompt={
          <>
            <QuestionPrompt>
              Over the past week, select medications that you consumed to manage your pain.
            </QuestionPrompt>
            <QuestionHint>Not taking medications? Just click the record button</QuestionHint>
            <QuestionHint>Generated based on your medication scripts</QuestionHint>
          </>
        }
        options={MEDICATION_OPTIONS}
        supportingTexts={MEDICATION_SUPPORTING_TEXT}
        selectedIndices={selected}
        onOptionPress={handleOptionPress}
        questionNumber={1}
        totalQuestions={4}
        onRecord={() => router.push('/tracker/management/otc')}
        variant="management"
        searchEnabled={false}
        selectedChipsEnabled={false}
      />
    </AssessmentScreen>
  );
}

