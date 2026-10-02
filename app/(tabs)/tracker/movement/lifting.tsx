import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export const LIFTING_OPTIONS = [
  'I can lift heavy weights without extra pain',
  'I can lift heavy weights but it gives extra pain',
  'I struggle to lift heavy weights off the floor, but I can lift them from a table.',
  'I struggle to lift heavy weights off the floor, but I can lift medium weights on the table',
  'I can lift very light weights',
  'I cannot lift or carry anything at all',
];

export default function LiftingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const selectedIndex = answers.liftingImpact
    ? LIFTING_OPTIONS.indexOf(answers.liftingImpact)
    : null;

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <SingleChoiceInput
          titleText="Lifting Impacts"
          options={LIFTING_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('liftingImpact', LIFTING_OPTIONS[index])}
          questionNumber={4}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/walking')}
          onRecord={() => router.push('/tracker/movement/sitting')}
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

