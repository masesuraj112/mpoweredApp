import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';

import { makeStyles, useThemeColors } from '@/constants/theme';
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
        cardHeight={scaleHeight(516)}
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
    color: colors.textSecondary,
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
  input: {
    height: scaleHeight(146),
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: scaleWidth(8),
    backgroundColor: colors.surface,
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    color: colors.text,
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
  },
}));
