import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { usePainAssessment } from '@/features/assessments/pain/context';

export default function ScreenName() {
  const { answers, updateAnswer } = usePainAssessment();

  return (
    <View>
      <Text>Prompt text goes here</Text>
      {/* input component goes here */}
      <Button title="Next" onPress={() => router.push('/tracker/pain/worst')} />
    </View>
  );
}