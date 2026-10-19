import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';
import {
  getAnswerLine,
  getEditAnswerLabel,
  getQuestionRowLabel,
} from '@/features/care-planner/planDisplay';
import type { QuestionGroup } from '@/features/care-planner/planTypes';

import { QuestionListItem } from './QuestionListItem';

type QuestionGroupListProps = {
  group: QuestionGroup;
  /** Leave out to show the questions read-only (no pen, rows not pressable). */
  onEditAnswer?: (questionId: number) => void;
};

export function QuestionGroupList({ group, onEditAnswer }: QuestionGroupListProps) {
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.title}>
        {group.title}
      </Text>
      <Card variant="muted" style={styles.card}>
        {group.questions.map((question, index) => {
          const { text, answered } = getAnswerLine(question);
          return (
            <QuestionListItem
              key={question.questionId}
              question={question.text}
              answerLine={text}
              answered={answered}
              rowLabel={getQuestionRowLabel(question)}
              editLabel={getEditAnswerLabel(question)}
              onEditAnswer={onEditAnswer ? () => onEditAnswer(question.questionId) : undefined}
              showDivider={index > 0}
            />
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  title: {
    ...Typography.labelLargeBold,
    color: Colors.light.onSurface,
  },
  card: {
    paddingVertical: Spacing.one,
    paddingHorizontal: 0,
  },
});
