import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const SOCIAL_HEALTH_OPTIONS = [
  'My social life is normal and gives me no extra pain',
  'My social life is normal but increases the degree of pain',
  'Pain has no significant effect on my social life apart from limiting my more energetic interests eg, gym, sports',
  'Pain has restricted my social life and I do not go out as often',
  'Pain has restricted my social life to home',
  'I have no social life because of pain',
];

export default function CareScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const savedIndex = SOCIAL_HEALTH_OPTIONS.indexOf(answers.socialLife ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }
    router.push('/tracker/social-health/travelling');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
        <SingleChoiceInput
          titleText="Social life"
          questionNumber={1}
          totalQuestions={7}
          options={SOCIAL_HEALTH_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('socialLife', SOCIAL_HEALTH_OPTIONS[index])}
          // onPrevious={() => router.push('/tracker/personal-care/general')}
          onRecord={handleNext}
          variant="personalCare"
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
});
