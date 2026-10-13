import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { SOCIAL_LIFE_OPTIONS } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// SingleChoiceInput takes a mutable string[]
const SOCIAL_HEALTH_OPTIONS: string[] = [...SOCIAL_LIFE_OPTIONS];

export default function SocialLifeScreen() {
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
          onRecord={handleNext}
          variant="personalCare"
          scrollable={false}
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
