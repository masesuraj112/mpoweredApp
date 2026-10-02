import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// standing.tsx
export const STANDING_OPTIONS = [
  'I can stand as long as I want without increased pain',
  'I can stand as long as I want but increased my pain',
  'Pain prevents me standing more than one hour',
  'Pain prevents me standing more than 30 minutes',
  'Pain prevents me from standing more than 10 minutes',
  'Pain prevents me from standing at all',
];


export default function StandingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
      const selectedIndex = answers.standingImpact
        ? STANDING_OPTIONS.indexOf(answers.standingImpact)
        : null;
    
      return (
        <View style={styles.screen}>
          <View style={styles.container}>
            <Text style={styles.pageTitle}>My Movement</Text>
            <SingleChoiceInput
              titleText="Standing Impacts"
              options={STANDING_OPTIONS}
              selectedIndex={selectedIndex}
              onSelectionChange={index => updateAnswer('standingImpact', STANDING_OPTIONS[index])}
              questionNumber={6}
              totalQuestions={7}
              onPrevious={() => router.push('/tracker/movement/sitting')}
              onRecord={() => router.push('/tracker/movement/reflection')}
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
    
    