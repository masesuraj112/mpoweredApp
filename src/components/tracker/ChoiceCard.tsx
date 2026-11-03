import type { ReactNode } from 'react';
import { Keyboard, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

/**
 * `painTracker` always shows Prev and Next. The other two show Prev only when there is a previous
 * question, and differ from it only in the smaller title.
 */
export type ChoiceCardVariant = 'painTracker' | 'personalCare' | 'management';

type ChoiceCardProps = {
  title: string;
  /** A string, or nested `<Text>` elements. */
  prompt: ReactNode;
  children: ReactNode;
  questionNumber?: number;
  totalQuestions?: number;
  /** Next, or Record on the last question. Without it the buttons are not shown. */
  onRecord?: () => void;
  onPrevious?: () => void;
  validationMessage?: string;
  /** Disables Next / Record, for example until an answer is chosen. */
  disabled?: boolean;
  variant?: ChoiceCardVariant;
  style?: StyleProp<ViewStyle>;
};

/**
 * The bordered card every tracker question sits in: title, prompt, the answer options, an optional
 * error message, and a footer with the question number and Prev / Next. It fills the page; the
 * options area takes the space left over, so long option lists should scroll inside it.
 */
export function ChoiceCard({
  title,
  prompt,
  children,
  questionNumber,
  totalQuestions,
  onRecord,
  onPrevious,
  validationMessage,
  disabled = false,
  variant = 'personalCare',
  style,
}: ChoiceCardProps) {
  const isPainTracker = variant === 'painTracker';
  const showPager = questionNumber !== undefined && totalQuestions !== undefined;
  const showNavigation = isPainTracker ? !!(onPrevious || onRecord) : !!onRecord;
  const showPrevious = isPainTracker || !!onPrevious;
  const isLastQuestion = showPager && questionNumber === totalQuestions;
  const nextDisabled = disabled || !onRecord;

  // Close the keyboard before moving on, otherwise it stays open over the next question.
  const handlePrevious = () => {
    Keyboard.dismiss();
    onPrevious?.();
  };
  const handleRecord = () => {
    Keyboard.dismiss();
    onRecord?.();
  };

  return (
    <View style={[styles.card, style]}>
      <AppText
        accessibilityRole="header"
        variant={isPainTracker ? 'titleLarge' : 'titleMedium'}
        color="onSurface">
        {title}
      </AppText>
      <Divider style={styles.rule} />

      {typeof prompt === 'string' ? (
        <AppText variant="labelMedium" color="onSurface" style={styles.prompt}>
          {prompt}
        </AppText>
      ) : (
        <View style={styles.prompt}>{prompt}</View>
      )}

      <View style={styles.options}>{children}</View>

      {validationMessage ? (
        <AppText
          accessibilityLiveRegion="polite"
          variant="bodySmall"
          color="error"
          style={styles.validation}>
          {validationMessage}
        </AppText>
      ) : null}

      {showPager || showNavigation ? (
        <View style={styles.footer}>
          {showPager ? (
            <View
              accessible
              accessibilityRole="text"
              accessibilityLabel={`Question ${questionNumber} of ${totalQuestions}`}
              style={styles.pager}>
              <AppText variant="labelLarge" color="onSurfaceVariant">
                {questionNumber}/{totalQuestions}
              </AppText>
            </View>
          ) : null}

          {showNavigation ? (
            <View style={styles.navigation}>
              {showPrevious ? (
                <NavButton
                  label="← Prev"
                  accessibilityLabel="Previous"
                  disabled={!onPrevious}
                  onPress={handlePrevious}
                />
              ) : null}
              <NavButton
                label={isLastQuestion ? 'Record' : 'Next →'}
                accessibilityLabel={isLastQuestion ? 'Record' : 'Next'}
                disabled={nextDisabled}
                dimmedStyle="tonal"
                onPress={handleRecord}
              />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

type NavButtonProps = {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  /** How the button looks when disabled: faded (default) or a pale tonal fill. */
  dimmedStyle?: 'faded' | 'tonal';
  onPress: () => void;
};

function NavButton({ label, accessibilityLabel, disabled, dimmedStyle = 'faded', onPress }: NavButtonProps) {
  const tonal = disabled && dimmedStyle === 'tonal';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        tonal && styles.navButtonTonal,
        disabled && !tonal && styles.navButtonFaded,
        pressed && styles.navButtonPressed,
      ]}>
      <AppText variant="labelLarge" color={tonal ? 'onSurfaceVariant' : 'onPrimary'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  rule: {
    marginVertical: Spacing.two,
  },
  prompt: {
    marginBottom: Spacing.two,
  },
  options: {
    flex: 1,
    minHeight: 0,
  },
  validation: {
    marginTop: Spacing.two,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  pager: {
    minHeight: MinTapTarget,
    minWidth: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.medium,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  navButton: {
    minHeight: MinTapTarget,
    minWidth: 105,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.large,
    backgroundColor: Colors.light.primary,
  },
  navButtonFaded: {
    opacity: 0.5,
  },
  navButtonTonal: {
    backgroundColor: Colors.light.secondaryContainer,
  },
  navButtonPressed: {
    opacity: 0.8,
  },
});
