import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionHint, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { router } from 'expo-router';
import { TextInput, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
export default function OtcScreen() {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = useManagementAssessment();
  const doneBar = useKeyboardDoneBar();

  return (
    <AssessmentScreen title="My Management">
      <ChoiceCard
        title="Medication"
        prompt={<QuestionPrompt>Over the past week, did you consume any over the counter (OTC) medication.</QuestionPrompt>}
        questionNumber={2}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/management/medication')}
        onRecord={() => router.push('/tracker/management/exercise')}
        variant="management"
      >
        <View style={styles.inputContent}>
          <QuestionHint>
            Not taking OTC medications? Just click the record button
          </QuestionHint>
          <TextInput
            accessibilityLabel="Over the counter medication name"
            multiline
            inputAccessoryViewID={doneBar.id}
            value={answers.otcMedication ?? ''}
            onChangeText={value => updateAnswer('otcMedication', value)}
            placeholder="Input name of over the counter medication"
            placeholderTextColor={colors.textSubtle}
            textAlignVertical="top"
            style={[inputStyles.input, inputStyles.multiline]}
          />
        </View>
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  inputContent: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  input: {
    height: 146,
    borderRadius: Radius.control,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: colors.text,
    ...Typography.bodySmall,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
}));
