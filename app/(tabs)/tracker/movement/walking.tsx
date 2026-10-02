import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export const WALKING_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

export default function WalkingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const selectedIndex = answers.walkingImpact
    ? WALKING_OPTIONS.indexOf(answers.walkingImpact)
    : null;

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <SingleChoiceInput
          titleText="Walking Impacts"
          options={WALKING_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('walkingImpact', WALKING_OPTIONS[index])}
          questionNumber={3}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/general')}
          onRecord={() => router.push('/tracker/movement/lifting')}
          variant="painTracker"
          cardHeight={scaleHeight(516)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: scaleWidth(24), paddingTop: scaleHeight(16) },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
});
