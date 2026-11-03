import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoicePrompt } from '@/components/tracker/ChoicePrompt';
import { AppText } from '@/components/ui/AppText';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { MOOD_EMOTION_VALUES, type MoodEmotion } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

// Icons for each stored mood value; the values themselves come from MOOD_EMOTION_VALUES.
const MOOD_ICONS: Record<MoodEmotion, { icon: number; selectedIcon: number }> = {
  frustrated: {
    icon: require('../../../../assets/images/social-health/frustrated-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/frustrated-selected.svg'),
  },
  sad: {
    icon: require('../../../../assets/images/social-health/sad-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/sad-selected.svg'),
  },
  okay: {
    icon: require('../../../../assets/images/social-health/okay-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/okay-selected.svg'),
  },
  calm: {
    icon: require('../../../../assets/images/social-health/calm-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/calm-selected.svg'),
  },
  delighted: {
    icon: require('../../../../assets/images/social-health/delighted-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/delighted-selected.svg'),
  },
};

const MOOD_EMOTIONS = MOOD_EMOTION_VALUES.map(value => ({ value, ...MOOD_ICONS[value] }));

export default function MoodEmotionScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const selected = MOOD_EMOTIONS.find(emotion => emotion.value === answers.moodEmotion);
  // Only show the mandatory message once the user has tried to continue without a selection.
  const [attemptedNext, setAttemptedNext] = useState(false);

  const handleNext = () => {
    if (!selected) {
      setAttemptedNext(true);
      return;
    }
    router.push('/tracker/social-health/mood-trigger');
  };

  const prompt = (
    <ChoicePrompt note="Tap below emoji to describe your mood">Over the past week, how was your mood generally?</ChoicePrompt>
  );

  return (
    <TrackerQuestionScreen title="My Social Health">
      <ChoiceCard
        title="Mood"
        prompt={prompt}
        questionNumber={6}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/social-health/enjoyment')}
        onRecord={handleNext}
        validationMessage={
          attemptedNext && !selected ? 'This question is mandatory and requires a response' : undefined
        }
        variant="personalCare"
      >
        <View style={styles.emojiRow}>
          {MOOD_EMOTIONS.map(emotion => {
            const isSelected = emotion.value === selected?.value;
            return (
              <Pressable
                key={emotion.value}
                onPress={() => updateAnswer('moodEmotion', emotion.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`I was feeling ${emotion.value}`}
                style={styles.emojiSlot}
              >
                {isSelected ? (
                  // The selected SVG is 40x40, with a drop shadow around the 24dp emoji.
                  <Image source={emotion.selectedIcon} style={styles.selectedIcon} contentFit="contain" />
                ) : (
                  <Image source={emotion.icon} style={styles.icon} contentFit="contain" />
                )}
              </Pressable>
            );
          })}
        </View>
        {/* Subtitle reflects the selected emotion. */}
        <AppText variant="labelLargeBold" color="text" style={styles.selectionText}>
          {selected ? `I was feeling ${selected.value}` : ''}
        </AppText>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

const styles = StyleSheet.create({
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  emojiSlot: {
    width: MinTapTarget,
    height: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  selectedIcon: {
    width: 40,
    height: 40,
  },
  selectionText: {
    marginTop: Spacing.mid,
    minHeight: Spacing.four,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
