import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

const pencilIcon = require('../../../assets/images/settings/pencil.svg');

type QuestionListItemProps = {
  question: string;
  /** Saved answer text, or the prompt to add one. */
  answerLine: string;
  answered: boolean;
  /** Spoken label for the whole row. */
  rowLabel: string;
  /** Spoken label for the pen button. */
  editLabel: string;
  /**
   * Opens the answer box on this question (tapping the row or the pen). Leave it out to show the
   * question read-only: no pen and the row cannot be pressed (answers cannot be added yet).
   */
  onEditAnswer?: () => void;
  /** Draws a divider above the item (every item after the first in a group). */
  showDivider: boolean;
};

export function QuestionListItem({
  question,
  answerLine,
  answered,
  rowLabel,
  editLabel,
  onEditAnswer,
  showDivider,
}: QuestionListItemProps) {
  const content = (
    <>
      <Text style={[styles.answerLine, answered ? styles.answered : styles.unanswered]}>
        {answerLine}
      </Text>
      <Text style={styles.question}>{question}</Text>
    </>
  );

  return (
    <View style={[styles.item, showDivider && styles.divider]}>
      {onEditAnswer ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rowLabel}
            onPress={onEditAnswer}
            style={styles.text}>
            {content}
          </Pressable>
          <IconButton icon={pencilIcon} accessibilityLabel={editLabel} onPress={onEditAnswer} />
        </>
      ) : (
        <View style={[styles.text, styles.readOnly]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.outline,
  },
  text: {
    flex: 1,
    minWidth: 0,
    minHeight: MinTapTarget,
    justifyContent: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.two,
  },
  readOnly: {
    paddingRight: Spacing.three,
  },
  answerLine: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  unanswered: {
    color: Colors.light.error,
  },
  answered: {
    color: Colors.light.success,
  },
  question: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
