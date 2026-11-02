import { ReactNode } from 'react';
import {
    Keyboard,
    StyleProp,
    Text,
    View,
    ViewStyle,
} from 'react-native';

import { Fonts, makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
interface ChoiceCardProps {
  title: string;
  /** Pass a string or nested `<Text>` elements */
  prompt: ReactNode;
  children: ReactNode;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  validationMessage?: string;
  cardHeight?: number;
  isRecording?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'painTracker' | 'personalCare' | 'management';
  style?: StyleProp<ViewStyle>;
}

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
  cardHeight,
  isRecording = false,
  disabled = false,
  variant = 'default',
  style,
}: ChoiceCardProps) {
  const footerStyles = useFooterStyles();
  const styles = useStyles();
  const isPainTracker = variant === 'painTracker';
  const isPersonalCare = variant === 'personalCare';
  const isManagement = variant === 'management';
  const isFlowAssessment = isPersonalCare || isManagement;
  const isAssessment = isPainTracker || isFlowAssessment;
  const showPager = questionNumber !== undefined && totalQuestions !== undefined;
  const showNavigation = (isPainTracker && (onPrevious || onRecord)) || (isFlowAssessment && !!onRecord);
  const showRecord = !!onRecord && !showNavigation;
  const isLastQuestion = showPager && questionNumber === totalQuestions;
  const showFooter = showPager || showRecord || showNavigation;

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
    <View
      style={[
        styles.container,
        isAssessment && (isPersonalCare ? styles.personalCareContainer : styles.painTrackerContainer),
        cardHeight !== undefined && { height: cardHeight },
        style,
      ]}
    >
      <Text
        style={[
          styles.titleText,
          isPainTracker && styles.painTrackerTitle,
            isFlowAssessment && styles.personalCareTitle,
        ]}
      >
        {title}
      </Text>
      <View style={[styles.divider, isAssessment && styles.painTrackerDivider]} />

      {typeof prompt === 'string' ? (
        <View style={[styles.promptWrapper, isFlowAssessment && styles.personalCarePromptWrapper]}>
          {typeof prompt === 'string' ? (
           <Text style={[styles.promptText, isFlowAssessment && styles.personalCarePromptText]}>{prompt}</Text>
          ) : (
            prompt
          )}
       </View>
      ) : (
        <View
          style={[
            styles.promptContainer,
            isPainTracker && styles.painTrackerPrompt,
            isFlowAssessment && styles.personalCarePromptContainer,
          ]}
        >
          {prompt}
        </View>
      )}

      <View style={[styles.optionsList, isAssessment && styles.painTrackerOptionsList]}>
        {children}
      </View>

      {validationMessage && (
        <Text style={styles.validationMessage}>{validationMessage}</Text>
      )}

      {showFooter && (
        <View
          style={[
            footerStyles.row,
            variant === 'painTracker' && footerStyles.painTrackerRow,
            !showPager && showRecord && footerStyles.rowRight,
            showPager && !showRecord && !showNavigation && footerStyles.rowLeft,
            showNavigation && footerStyles.navigationRow,
          ]}
        >
          {showPager && (
            <View
              style={[
                footerStyles.pill,
                isAssessment && footerStyles.painTrackerPager,
              ]}
              accessibilityRole="text"
            >
              <Text style={[footerStyles.pillText, isFlowAssessment && footerStyles.personalCarePagerText]}>
                {questionNumber}/{totalQuestions}
              </Text>
            </View>
          )}

          {showNavigation && (
            <View style={footerStyles.navigationGroup}>
              {/* First steps omit Previous when no previous route is provided. */}
              {(!isFlowAssessment || onPrevious) && (
                <Button
                  label="Prev"
                  leadingGlyph="←"
                  accessibilityLabel="Previous"
                  variant="outlined"
                  onPress={handlePrevious}
                  disabled={previousDisabled || !onPrevious}
                />
              )}
              <Button
                label={isAssessment && isLastQuestion ? 'Record' : isLastQuestion ? 'Finish' : 'Next'}
                trailingGlyph={isLastQuestion ? undefined : '→'}
                variant="primary"
                onPress={handleRecord}
                disabled={disabled || isRecording || !onRecord}
              />
            </View>
          )}

          {showRecord && (
            <Button
              label={isRecording ? 'Recording…' : 'Record'}
              trailingGlyph={isRecording ? undefined : '→'}
              accessibilityLabel="Record answer"
              variant="primary"
              onPress={handleRecord}
              disabled={disabled || isRecording}
            />
          )}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    borderRadius: Radius.card,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    backgroundColor: colors.surfaceContainer,
  },
  titleText: {
    color: colors.text,
    ...Typography.headline,
    fontFamily: Fonts.headingRegular,
    marginBottom: Spacing.three,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.text,
    width: '100%',
    marginBottom: Spacing.three,
  },
  promptContainer: {
    marginBottom: Spacing.two,
  },
  promptWrapper: {
    marginBottom: Spacing.two,
  },
  promptText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  validationMessage: {
    color: colors.error,
    ...Typography.caption,
    textAlign: 'right',
    marginTop: Spacing.two,
  },
  optionsList: {
    width: '100%',
  },
  painTrackerOptionsList: {
    flex: 1,
    minHeight: 0,
  },
  painTrackerContainer: {
    height: 572,
    borderRadius: Radius.card,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  personalCareContainer: {
    flex: 1,
    minHeight: 0,
    borderRadius: Radius.card,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  painTrackerTitle: {
    color: colors.text,
    ...Typography.titleSmall,
    fontFamily: Fonts.headingRegular,
    marginBottom: Spacing.two,
  },
  personalCareTitle: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    letterSpacing: 0.15,
    marginBottom: Spacing.two,
    color: colors.text,
  },
  painTrackerDivider: {
    borderTopColor: colors.divider,
    marginBottom: Spacing.three,
  },
  painTrackerPrompt: {
    height: 68,
    marginBottom: Spacing.one,
  },
  personalCarePromptContainer: {
    marginBottom: Spacing.three,
  },
  personalCarePromptWrapper: {
    marginBottom: Spacing.three,
  },
  personalCarePromptText: {
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.text,
  },
}));

const useFooterStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.three,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  painTrackerRow: {
    flexShrink: 0,
    marginTop: Spacing.two,
  },
  navigationRow: {
    justifyContent: 'space-between',
  },
  navigationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  pill: {
    borderRadius: Radius.pill,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  painTrackerPager: {
    width: 54,
    height: 31,
    borderRadius: Radius.control,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  personalCarePagerText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pillText: {
    ...Typography.subtitle,
    fontWeight: '400',
    color: colors.text,
  },
}));