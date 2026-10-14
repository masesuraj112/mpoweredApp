import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton';
import { Colors, Spacing } from '@/constants/theme';

const pencilIcon = require('../../../assets/images/settings/pencil.svg');

type QuestionListItemProps = {
  question: string;
  /** Saved answer text, or the prompt to add one. */
  answerLine: string;
  answered: boolean;
  /** Spoken label for the pen button. */
  editLabel: string;
  onEditAnswer: () => void;
  /** Draws a divider above the item (every item after the first in a group). */
  showDivider: boolean;
};

export function QuestionListItem({
  question,
  answerLine,
  answered,
  editLabel,
  onEditAnswer,
  showDivider,
}: QuestionListItemProps) {
  return (
    <View style={[styles.item, showDivider && styles.divider]}>
      <View style={styles.text}>
        <Text style={[styles.answerLine, answered ? styles.answered : styles.unanswered]}>
          {answerLine}
        </Text>
        <Text style={styles.question}>{question}</Text>
      </View>
      <IconButton icon={pencilIcon} accessibilityLabel={editLabel} onPress={onEditAnswer} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingLeft: Spacing.three,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.outline,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
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
