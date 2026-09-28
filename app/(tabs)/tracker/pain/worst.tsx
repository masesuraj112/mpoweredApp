import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { scaleFont } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';


export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <View style={styles.screen}>
      {/* input component goes here */}
      <Text style={styles.cardTitle}>My Pain</Text>
      
      <ScaleSliderInput
        underLinedText="worst pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={5}
        totalQuestions={6}
        initialValue={answers.worstPain ?? 0}
        onValueChange={value => updateAnswer('worstPain', value)}
        onPrevious={() => router.push('/tracker/pain/mildest')}
        onRecord={() => router.push('/tracker/pain/average')}
        variant="painTracker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    paddingTop: 20, // extra top space to clear the status bar/notch area
  },
  cardTitle: {
      fontSize: scaleFont(26),
      fontWeight: '500',
      marginBottom: 20
  },
});
