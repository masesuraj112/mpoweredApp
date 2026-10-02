import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const MOOD_EMOTIONS = [
  {
    value: 'frustrated',
    icon: require('../../../../assets/images/social-health/frustrated-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/frustrated-selected.svg'),
    iconHeight: 24,
  },
  {
    value: 'sad',
    icon: require('../../../../assets/images/social-health/sad-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/sad-selected.svg'),
    iconHeight: 24,
  },
  {
    value: 'okay',
    icon: require('../../../../assets/images/social-health/okay-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/okay-selected.svg'),
    iconHeight: 24,
  },
  {
    value: 'calm',
    icon: require('../../../../assets/images/social-health/calm-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/calm-selected.svg'),
    iconHeight: 25,
  },
  {
    value: 'delighted',
    icon: require('../../../../assets/images/social-health/delighted-unselected.svg'),
    selectedIcon: require('../../../../assets/images/social-health/delighted-selected.svg'),
    iconHeight: 25,
  },
];

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
    <View>
      <Text style={styles.questionText}>Over the past week, how was your mood generally?</Text>
      <Text style={styles.hintText}>Tap below emoji to describe your mood</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
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
          cardHeight={scaleHeight(300)}
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
                  hitSlop={scaleWidth(12)}
                  style={styles.emojiSlot}
                >
                  {isSelected ? (
                    // The selected SVG is 40x40 with a drop shadow bleeding past the 24px emoji.
                    <Image source={emotion.selectedIcon} style={styles.selectedIcon} contentFit="contain" />
                  ) : (
                    <Image
                      source={emotion.icon}
                      style={{ width: scaleWidth(24), height: scaleWidth(emotion.iconHeight) }}
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
  questionText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000',
  },
  hintText: {
    marginTop: scaleHeight(1),
    fontSize: scaleFont(11),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#79747E',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaleWidth(34),
    marginTop: scaleHeight(4),
  },
  emojiSlot: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIcon: {
    position: 'absolute',
    top: scaleWidth(-6),
    left: scaleWidth(-8),
    width: scaleWidth(40),
    height: scaleWidth(40),
  },
  selectionText: {
    marginTop: scaleHeight(14),
    minHeight: scaleHeight(16),
    fontSize: scaleFont(13),
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000',
  },
});
