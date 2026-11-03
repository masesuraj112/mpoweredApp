import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionHint, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { MOOD_EMOTION_VALUES, type MoodEmotion } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
// Icons for each stored mood value; the values themselves come from MOOD_EMOTION_VALUES.
const MOOD_ICONS: Record<MoodEmotion, { icon: number; selectedIcon: number; iconHeight: number }> = {
  frustrated: {
    icon: require('@/assets/images/social-health/frustrated-unselected.svg'),
    selectedIcon: require('@/assets/images/social-health/frustrated-selected.svg'),
    iconHeight: 24,
  },
  sad: {
    icon: require('@/assets/images/social-health/sad-unselected.svg'),
    selectedIcon: require('@/assets/images/social-health/sad-selected.svg'),
    iconHeight: 24,
  },
  okay: {
    icon: require('@/assets/images/social-health/okay-unselected.svg'),
    selectedIcon: require('@/assets/images/social-health/okay-selected.svg'),
    iconHeight: 24,
  },
  calm: {
    icon: require('@/assets/images/social-health/calm-unselected.svg'),
    selectedIcon: require('@/assets/images/social-health/calm-selected.svg'),
    iconHeight: 25,
  },
  delighted: {
    icon: require('@/assets/images/social-health/delighted-unselected.svg'),
    selectedIcon: require('@/assets/images/social-health/delighted-selected.svg'),
    iconHeight: 25,
  },
};

const MOOD_EMOTIONS = MOOD_EMOTION_VALUES.map(value => ({ value, ...MOOD_ICONS[value] }));

export default function MoodEmotionScreen() {
  const styles = useStyles();
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
    <View>
      <QuestionPrompt>Over the past week, how was your mood generally?</QuestionPrompt>
      <QuestionHint>Tap below emoji to describe your mood</QuestionHint>
    </View>
  );

  return (
    <AssessmentScreen title="My Social Health">
      <ChoiceCard
        title="Mood"
        prompt={prompt}
        questionNumber={6}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/social-health/enjoyment')}
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
                hitSlop={12}
                style={styles.emojiSlot}
              >
                {isSelected ? (
                  // The selected SVG is 40x40 with a drop shadow bleeding past the 24px emoji.
                  <Image source={emotion.selectedIcon} style={styles.selectedIcon} contentFit="contain" />
                ) : (
                  <Image
                    source={emotion.icon}
                    style={{ width: 24, height: emotion.iconHeight }}
                    contentFit="contain"
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        {/* Subtitle reflects the selected emotion. */}
        <Text style={styles.selectionText}>{selected ? `I was feeling ${selected.value}` : ''}</Text>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.five,
    marginTop: Spacing.one,
  },
  emojiSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    position: 'absolute',
    top: -6,
    left: -8,
    width: 40,
    height: 40,
  },
  selectionText: {
    marginTop: Spacing.three,
    minHeight: 16,
    ...Typography.caption,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: colors.text,
  },
}));
