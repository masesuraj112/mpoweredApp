import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';
import { Keyboard, Pressable, Text } from 'react-native';
import { Spacing, Typography, makeStyles } from '@/constants/theme';


export default function CurrePainLevel() {
  const styles = useStyles();
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    // Tapping anywhere outside a text box closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      {/* input component goes here */}
      <Text style={styles.cardTitle}>My Pain</Text>
      
      <ScaleSliderInput
        underLinedText="mildest pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={4}
        totalQuestions={6}
        initialValue={answers.mildestPain ?? 0}
        onValueChange={value => updateAnswer('mildestPain', value)}
        onPrevious={() => router.push('/tracker/pain/current')}
        onRecord={() => {
          // an untouched slider never writes an answer, so write the value shown
          updateAnswer('mildestPain', answers.mildestPain ?? 0);
          router.push('/tracker/pain/worst');
        }}
        variant="painTracker"
      />

    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four, // extra top space to clear the status bar/notch area
  },
  cardTitle: {
      color: colors.text,
      ...Typography.headline,
      marginBottom: Spacing.three
  },
}));
