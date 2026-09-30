import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const GENERAL_ACTIVITY_OPTIONS = [
  'I am not doing any jobs that I usually do around the house',
  'I get dressed more slowly than usual because of my pain',
  'I sleep less well because of my pain',
  'I am more irritable and bad tempered with people than usual',
  'I try to get other people to do things for me because of my pain',
];

export default function GeneralScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedActivities = answers.generalActivities ?? [];
  const selected = GENERAL_ACTIVITY_OPTIONS.reduce<number[]>((indices, activity, index) => {
    if (savedActivities.includes(activity)) {
      indices.push(index);
    }
    return indices;
  }, []);

  const handleSelectionChange = (selectedIndices: number[]) => {
    updateAnswer('generalActivities', selectedIndices.map(index => GENERAL_ACTIVITY_OPTIONS[index]));
  };

  const handleNext = () => {
    if (selected.length === 0) {
      return;
    }

    router.push('/tracker/personal-care/care');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Personal Care</Text>
        <MultiChoiceList
          title="General Activities Impacts"
          prompt={
            <Text style={styles.prompt}>
              Select <Text style={styles.underlinedPrompt}>ALL</Text> relevant statements:
            </Text>
          }
          options={GENERAL_ACTIVITY_OPTIONS}
          selectedIndices={selected}
          onSelectionChange={handleSelectionChange}
          questionNumber={1}
          totalQuestions={4}
          onRecord={handleNext}
          disabled={selected.length === 0}
          variant="personalCare"
          searchEnabled={false}
          scrollable
          selectedChipsEnabled={false}
          cardHeight={scaleHeight(558)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  prompt: {
    color: '#1D1B20',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  underlinedPrompt: {
    textDecorationLine: 'underline',
  },
});
