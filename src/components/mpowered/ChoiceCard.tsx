import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { ReactNode } from 'react';
import {
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

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
  variant?: 'default' | 'painTracker';
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
  const showPager = questionNumber !== undefined && totalQuestions !== undefined;
  const showNavigation = variant === 'painTracker' && (onPrevious || onRecord);
  const showRecord = !!onRecord && !showNavigation;
  const showFooter = showPager || showRecord || showNavigation;

  return (
    <View
      style={[
        styles.container,
        variant === 'painTracker' && styles.painTrackerContainer,
        cardHeight !== undefined && { height: cardHeight },
        style,
      ]}
    >
      <Text style={[styles.titleText, variant === 'painTracker' && styles.painTrackerTitle]}>{title}</Text>
      <View style={[styles.divider, variant === 'painTracker' && styles.painTrackerDivider]} />

      {typeof prompt === 'string' ? (
        <View style={styles.promptWrapper}>
          {typeof prompt === 'string' ? (
           <Text style={styles.promptText}>{prompt}</Text>
          ) : (
            prompt
          )}
       </View>
      ) : (
        <View style={[styles.promptContainer, variant === 'painTracker' && styles.painTrackerPrompt]}>{prompt}</View>
      )}

      <View style={[styles.optionsList, variant === 'painTracker' && styles.painTrackerOptionsList]}>
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
                variant === 'painTracker' && footerStyles.painTrackerPager,
              ]}
              accessibilityRole="text"
            >
              <Text style={footerStyles.pillText}>
                {questionNumber}/{totalQuestions}
              </Text>
            </View>
          )}

          {showNavigation && (
            <View style={footerStyles.navigationGroup}>
              <Pressable
                onPress={onPrevious}
                disabled={previousDisabled || !onPrevious}
                accessibilityRole="button"
                accessibilityLabel="Previous"
                accessibilityState={{ disabled: previousDisabled || !onPrevious }}
                style={[footerStyles.navigationButton, (previousDisabled || !onPrevious) && footerStyles.buttonDisabled]}
              >
                <Text style={footerStyles.navigationButtonText}>← Prev</Text>
              </Pressable>
              <Pressable
                onPress={onRecord}
                disabled={disabled || isRecording || !onRecord}
                accessibilityRole="button"
                accessibilityLabel="Next"
                accessibilityState={{ disabled: disabled || isRecording || !onRecord }}
                style={[
                  footerStyles.navigationButton,
                  (disabled || isRecording || !onRecord) && footerStyles.disabledNavigationButton,
                ]}
              >
                <Text
                  style={[
                    footerStyles.nextButtonText,
                    (disabled || isRecording || !onRecord) && footerStyles.disabledNavigationButtonText,
                  ]}
                >
                  Next →
                </Text>
              </Pressable>
            </View>
          )}

          {showRecord && (
            <Pressable
              onPress={onRecord}
              disabled={disabled || isRecording}
              accessibilityRole="button"
              accessibilityLabel="Record answer"
              accessibilityState={{ disabled: disabled || isRecording }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={({ pressed }) => [
                footerStyles.pill,
                footerStyles.recordButton,
                variant === 'painTracker' && footerStyles.painTrackerRecordButton,
                pressed && footerStyles.recordButtonPressed,
                (disabled || isRecording) && footerStyles.buttonDisabled,
              ]}
            >
              <Text style={[footerStyles.pillText, variant === 'painTracker' && footerStyles.painTrackerRecordText]}>
                {isRecording ? 'Recording...' : 'Record'}
              </Text>
              {!isRecording && (
                <Text style={[footerStyles.arrow, variant === 'painTracker' && footerStyles.painTrackerRecordText]}>
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

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: 'black',
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
    borderTopColor: 'black',
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
    color: '#B3261E',
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
    borderColor: '#AEAEB2',
    borderRadius: scaleWidth(12),
    paddingTop: scaleHeight(16),
    paddingHorizontal: scaleWidth(19),
    paddingBottom: scaleHeight(12),
    backgroundColor: '#FFFFFF',
  },
  painTrackerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '400',
    marginBottom: scaleHeight(10),
  },
  painTrackerDivider: {
    borderTopColor: '#CAC4D0',
    marginBottom: scaleHeight(14),
  },
  painTrackerPrompt: {
    height: scaleHeight(68),
    marginBottom: scaleHeight(4),
  },
});

const footerStyles = StyleSheet.create({
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
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(12),
    backgroundColor: '#6750A4',
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#6750A4',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  pill: {
    borderWidth: 1,
    borderColor: 'black',
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
    backgroundColor: '#F2F2F5',
  },
  painTrackerRecordButton: {
    width: scaleWidth(105),
    height: scaleHeight(30),
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(16),
    paddingVertical: 0,
    paddingHorizontal: scaleWidth(16),
    backgroundColor: '#6750A4',
  },
  painTrackerPager: {
    width: scaleWidth(54),
    height: scaleHeight(31),
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(8),
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  painTrackerRecordText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#FEF7FF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disabledNavigationButton: {
    backgroundColor: '#E8DEF8',
  },
  disabledNavigationButtonText: {
    color: '#49454F',
  },
  pillText: {
    fontSize: scaleFont(18),
    fontWeight: '400',
    color: 'black',
  },
  arrow: {
    fontSize: scaleFont(18),
    fontWeight: '400',
    color: 'black',
  },
});