import { ReactNode } from 'react';
import { Keyboard, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { ArrowGlyph } from '@/components/ui/icons';

interface ChoiceCardProps {
  title: string;
  /** A string, or `QuestionPrompt` / `QuestionHint` elements (wrapped in a View for more than one). */
  prompt: ReactNode;
  children: ReactNode;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  validationMessage?: string;
  isRecording?: boolean;
  disabled?: boolean;
  /**
   * Only changes the wording of the main button: an assessment (`painTracker`, `personalCare`,
   * `management`) ends on Record, a plain questionnaire on Finish. Every variant looks the same.
   */
  variant?: 'default' | 'painTracker' | 'personalCare' | 'management';
  /** Placement only (margins); the card sizes itself. */
  style?: StyleProp<ViewStyle>;
}

/**
 * One assessment question: a title, the question, its answers, then the question count and the
 * Previous / Next (or Record) buttons. The card is as tall as what it holds, and the page scrolls when the
 * answers are longer than the screen.
 */
export function ChoiceCard({
  title,
  prompt,
  children,
  questionNumber,
  totalQuestions,
  onRecord,
  onPrevious,
  previousDisabled = false,
  validationMessage,
  isRecording = false,
  disabled = false,
  variant = 'default',
  style,
}: ChoiceCardProps) {
  const styles = useStyles();
  const isAssessment = variant !== 'default';
  const showPager = questionNumber !== undefined && totalQuestions !== undefined;
  const isLastQuestion = showPager && questionNumber === totalQuestions;
  // A single question with no count records its answer straight away.
  const recordOnly = !showPager && !onPrevious;
  const primaryLabel = recordOnly
    ? isRecording
      ? 'Recording…'
      : 'Record'
    : isLastQuestion
      ? isAssessment
        ? 'Record'
        : 'Finish'
      : 'Next';
  const primaryAccessibilityLabel = recordOnly ? 'Record answer' : primaryLabel;
  const primaryDisabled = disabled || isRecording || !onRecord;
  const showFooter = showPager || !!onRecord || !!onPrevious;

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
      {/* The title, rule and question sit closer together than the rest of the card. */}
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <View style={styles.divider} />
        <View style={styles.prompt}>
          {typeof prompt === 'string' ? <QuestionPrompt>{prompt}</QuestionPrompt> : prompt}
        </View>
      </View>

      <View style={styles.answers}>{children}</View>

      {validationMessage ? (
        <Text accessibilityRole="alert" style={styles.validationMessage}>
          {validationMessage}
        </Text>
      ) : null}

      {showFooter && (
        <View style={styles.footer}>
          {showPager ? (
            <View style={styles.pager}>
              <Text style={styles.pagerText}>
                {questionNumber}/{totalQuestions}
              </Text>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.buttons}>
            {onPrevious && (
              <Pressable
                onPress={handlePrevious}
                disabled={previousDisabled}
                accessibilityRole="button"
                accessibilityLabel="Previous"
                accessibilityState={{ disabled: previousDisabled }}
                style={({ pressed }) => [
                  styles.button,
                  styles.secondaryButton,
                  previousDisabled && styles.disabled,
                  pressed && styles.pressed,
                ]}>
                <ArrowGlyph direction="left" style={[styles.buttonText, styles.secondaryButtonText]} />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Prev</Text>
              </Pressable>
            )}
            {onRecord && (
              <Pressable
                onPress={handleRecord}
                disabled={primaryDisabled}
                accessibilityRole="button"
                accessibilityLabel={primaryAccessibilityLabel}
                accessibilityState={{ disabled: primaryDisabled }}
                style={({ pressed }) => [
                  styles.button,
                  primaryDisabled ? styles.disabledButton : styles.primaryButton,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.buttonText, primaryDisabled ? styles.disabledButtonText : styles.primaryButtonText]}>
                  {primaryLabel}
                </Text>
                {!isLastQuestion && !recordOnly && (
                  <ArrowGlyph style={[styles.buttonText, primaryDisabled ? styles.disabledButtonText : styles.primaryButtonText]} />
                )}
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

/** The question itself. Nest a `<Text>` with only `textDecorationLine` to underline a word. */
export function QuestionPrompt({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.promptText}>{children}</Text>;
}

/** A secondary line under the question: examples, "scroll for more", where the options come from. */
export function QuestionHint({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.hintText}>{children}</Text>;
}

const useStyles = makeStyles((colors) => ({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  title: {
    ...Typography.titleSmall,
    color: colors.text,
  },
  heading: {
    gap: Spacing.two,
  },
  divider: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.divider,
  },
  prompt: {
    gap: Spacing.one,
  },
  promptText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  hintText: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  answers: {
    gap: Spacing.three,
  },
  validationMessage: {
    ...Typography.bodySmall,
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  pager: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.surface,
  },
  pagerText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    gap: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.secondaryContainer,
  },
  disabledButton: {
    backgroundColor: colors.secondaryContainer,
  },
  buttonText: {
    ...Typography.labelLargeBold,
  },
  primaryButtonText: {
    color: colors.onPrimary,
  },
  secondaryButtonText: {
    color: colors.onSecondaryContainer,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
}));
