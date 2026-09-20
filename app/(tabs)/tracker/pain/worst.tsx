import { StyleSheet, View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { scaleFont } from '@/services/scale';


export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <View style={styles.screen}>
      {/* input component goes here */}
      <Text style={styles.cardTitle}>My Pain</Text>
      
      <ScaleSliderInput underLinedText={'worst pain'} titleText={'Pain Intensity'} assessmentType={'pain'} questionNumber={5} totalQuestions={6} onRecord={() => router.push('/tracker/pain/average')}/> 
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
