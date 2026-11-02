import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
export default function OtcScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = useManagementAssessment();
  const doneBar = useKeyboardDoneBar();

  return (
    <AssessmentScreen title="My Management">
      <ChoiceCard
        title="Medication"
        prompt={<Text style={styles.prompt}>Over the past week, did you consume any over the counter (OTC) medication.</Text>}
        questionNumber={2}
        totalQuestions={4}
        onPrevious={() => router.push('/tracker/management/medication')}
        onRecord={() => router.push('/tracker/management/exercise')}
        variant="management"
        cardHeight={516}
      >
        <View style={styles.inputContent}>
          <Text style={styles.helperText}>
            Not taking OTC medications? Just click the record button
          </Text>
          <TextInput
            accessibilityLabel="Over the counter medication name"
            multiline
            inputAccessoryViewID={doneBar.id}
            value={answers.otcMedication ?? ''}
            onChangeText={value => updateAnswer('otcMedication', value)}
            placeholder="Input name of over the counter medication"
            placeholderTextColor={colors.textSubtle}
            textAlignVertical="top"
            style={styles.input}
          />
        </View>
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  prompt: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  inputContent: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  helperText: {
    color: colors.textSecondary,
    ...Typography.caption,
    fontStyle: 'italic',
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
