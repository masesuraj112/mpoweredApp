import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';


// sitting.tsx
export const SITTING_OPTIONS = [
  'I can sit in any chair as long as I like',
  'I can only sit in my favourite chair as long as I like',
  'Pain prevents me from sitting more than one hour',
  'Pain prevents me from sitting more than 30 minutes',
  'Pain prevents me from sitting more than 10 minutes',
  'Pain prevents me from sitting at all',
];

export default function SittingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
    const selectedIndex = answers.sittingImpact
      ? SITTING_OPTIONS.indexOf(answers.sittingImpact)
      : null;
  
    return (
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>My Movement</Text>
          <SingleChoiceInput
            titleText="Sitting Impacts"
            options={SITTING_OPTIONS}
            selectedIndex={selectedIndex}
            onSelectionChange={index => updateAnswer('sittingImpact', SITTING_OPTIONS[index])}
            questionNumber={5}
            totalQuestions={7}
            onPrevious={() => router.push('/tracker/movement/lifting')}
            onRecord={() => router.push('/tracker/movement/standing')}
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
  
  