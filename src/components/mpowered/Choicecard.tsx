import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '@/services/scale';

interface ChoiceCardProps {
  title: string;
  /** Pass a string or nested `<Text>` elements */
  prompt: ReactNode;
  children: ReactNode;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  isRecording?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ChoiceCard({
  title,
  prompt,
  children,
  questionNumber,
  totalQuestions,
  onRecord,
  isRecording = false,
  disabled = false,
  style,
}: ChoiceCardProps) {
  const showPager = questionNumber !== undefined && totalQuestions !== undefined;
  const showRecord = !!onRecord;
  const showFooter = showPager || showRecord;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.titleText}>{title}</Text>
      <View style={styles.divider} />

      {typeof prompt === 'string' ? (
        <Text style={styles.promptText}>{prompt}</Text>
      ) : (
        <View style={styles.promptContainer}>{prompt}</View>
      )}

      <View style={styles.optionsList}>{children}</View>

      {showFooter && (
        <View
          style={[
            footerStyles.row,
            !showPager && showRecord && footerStyles.rowRight,
            showPager && !showRecord && footerStyles.rowLeft,
          ]}
        >
          {showPager && (
            <View style={footerStyles.pill} accessibilityRole="text">
              <Text style={footerStyles.pillText}>
                {questionNumber}/{totalQuestions}
              </Text>
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
                pressed && footerStyles.recordButtonPressed,
                (disabled || isRecording) && footerStyles.buttonDisabled,
              ]}
            >
              <Text style={footerStyles.pillText}>
                {isRecording ? 'Recording...' : 'Record'}
              </Text>
              {!isRecording && <Text style={footerStyles.arrow}>→</Text>}
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
  promptText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    marginBottom: scaleHeight(10),
  },
  optionsList: {
    width: '100%',
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
  buttonDisabled: {
    opacity: 0.5,
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