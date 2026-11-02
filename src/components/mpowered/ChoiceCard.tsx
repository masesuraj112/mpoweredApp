import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { ReactNode } from 'react';
import {
    Keyboard,
    Pressable,
    StyleProp,
    Text,
    View,
    ViewStyle,
} from 'react-native';

import { makeStyles } from '@/constants/theme';
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
                <Pressable
                  onPress={handlePrevious}
                  disabled={previousDisabled || !onPrevious}
                  accessibilityRole="button"
                  accessibilityLabel="Previous"
                  accessibilityState={{ disabled: previousDisabled || !onPrevious }}
                  style={[footerStyles.navigationButton, (previousDisabled || !onPrevious) && footerStyles.buttonDisabled]}
                >
                  <Text style={footerStyles.navigationButtonText}>← Prev</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleRecord}
                disabled={disabled || isRecording || !onRecord}
                accessibilityRole="button"
                accessibilityLabel={isAssessment && isLastQuestion ? 'Record' : isLastQuestion ? 'Finish' : 'Next'}
                accessibilityState={{ disabled: disabled || isRecording || !onRecord }}
                style={[
                  footerStyles.navigationButton,
                  (disabled || isRecording || !onRecord) &&
                    footerStyles.disabledNavigationButton,
                ]}
              >
                <Text
                  style={[
                    footerStyles.nextButtonText,
                    (disabled || isRecording || !onRecord) &&
                      footerStyles.disabledNavigationButtonText,
                  ]}
                >
                  {isAssessment && isLastQuestion ? 'Record' : isLastQuestion ? 'Finish' : 'Next →'}
                </Text>
              </Pressable>
            </View>
          )}

          {showRecord && (
            <Pressable
              onPress={handleRecord}
              disabled={disabled || isRecording}
              accessibilityRole="button"
              accessibilityLabel="Record answer"
              accessibilityState={{ disabled: disabled || isRecording }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                footerStyles.pill,
                footerStyles.recordButton,
                isAssessment && footerStyles.painTrackerRecordButton,
                pressed && footerStyles.recordButtonPressed,
                (disabled || isRecording) && footerStyles.buttonDisabled,
              ]}
            >
              <Text style={[footerStyles.pillText, isAssessment && footerStyles.painTrackerRecordText]}>
                {isRecording ? 'Recording...' : 'Record'}
              </Text>
              {!isRecording && (
                <Text style={[footerStyles.arrow, isAssessment && footerStyles.painTrackerRecordText]}>
                  →
                </Text>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: scaleWidth(20),
    paddingTop: scaleHeight(24),
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(20),
  },
  titleText: {
    fontSize: scaleFont(28),
    fontWeight: '500',
    marginBottom: scaleHeight(15),
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.text,
    width: '100%',
    marginBottom: scaleHeight(20),
  },
  promptContainer: {
    marginBottom: scaleHeight(10),
  },
  promptWrapper: {
    marginBottom: scaleHeight(10),
  },
  promptText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
  validationMessage: {
    color: colors.error,
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
    textAlign: 'right',
    marginTop: scaleHeight(10),
  },
  optionsList: {
    width: '100%',
  },
  painTrackerOptionsList: {
    flex: 1,
    minHeight: 0,
  },
  painTrackerContainer: {
    height: scaleHeight(572),
    borderColor: colors.outline,
    borderRadius: scaleWidth(12),
    paddingTop: scaleHeight(16),
    paddingHorizontal: scaleWidth(19),
    paddingBottom: scaleHeight(12),
    backgroundColor: colors.surface,
  },
  personalCareContainer: {
    flex: 1,
    minHeight: 0,
    borderColor: colors.outline,
    borderRadius: scaleWidth(12),
    paddingTop: scaleHeight(16),
    paddingHorizontal: scaleWidth(19),
    paddingBottom: scaleHeight(12),
    backgroundColor: colors.surface,
  },
  painTrackerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '400',
    marginBottom: scaleHeight(10),
  },
  personalCareTitle: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    lineHeight: scaleHeight(24),
    letterSpacing: 0.15,
    marginBottom: scaleHeight(10),
    color: colors.text,
  },
  painTrackerDivider: {
    borderTopColor: colors.divider,
    marginBottom: scaleHeight(14),
  },
  painTrackerPrompt: {
    height: scaleHeight(68),
    marginBottom: scaleHeight(4),
  },
  personalCarePromptContainer: {
    marginBottom: scaleHeight(14),
  },
  personalCarePromptWrapper: {
    marginBottom: scaleHeight(14),
  },
  personalCarePromptText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
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
    marginTop: scaleHeight(20),
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  painTrackerRow: {
    flexShrink: 0,
    marginTop: scaleHeight(12),
  },
  navigationRow: {
    justifyContent: 'space-between',
  },
  navigationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
  },
  navigationButton: {
    width: scaleWidth(105),
    height: scaleHeight(31),
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: scaleWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(12),
    backgroundColor: colors.primary,
  },
  navigationButtonText: {
    color: colors.onPrimary,
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.primary,
  },
  nextButtonText: {
    color: colors.onPrimary,
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: scaleWidth(24),
    paddingVertical: scaleHeight(10),
    paddingHorizontal: scaleWidth(22),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    gap: scaleWidth(8),
  },
  recordButtonPressed: {
    backgroundColor: colors.background,
  },
  painTrackerRecordButton: {
    width: scaleWidth(105),
    height: scaleHeight(30),
    borderColor: colors.outline,
    borderRadius: scaleWidth(16),
    paddingVertical: 0,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: colors.primary,
  },
  painTrackerPager: {
    width: scaleWidth(54),
    height: scaleHeight(31),
    borderColor: colors.outline,
    borderRadius: scaleWidth(8),
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  painTrackerRecordText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: colors.onPrimary,
  },
  personalCarePagerText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disabledNavigationButton: {
    backgroundColor: colors.secondaryContainer,
  },
  disabledNavigationButtonText: {
    color: colors.textSecondary,
  },
  pillText: {
    fontSize: scaleFont(18),
    fontWeight: '400',
    color: colors.text,
  },
  arrow: {
    fontSize: scaleFont(18),
    fontWeight: '400',
    color: colors.text,
  },
}));