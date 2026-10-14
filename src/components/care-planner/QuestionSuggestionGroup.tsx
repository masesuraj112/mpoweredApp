import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import { getSuggestionLabel } from '@/features/care-planner/suggestionSelection';
import type { SuggestedQuestionGroup } from '@/features/care-planner/suggestionTypes';

import { SuggestedQuestionRow } from './SuggestedQuestionRow';

type QuestionSuggestionGroupProps = {
  group: SuggestedQuestionGroup;
  selectedIds: readonly number[];
  onToggle: (questionId: number) => void;
};

export function QuestionSuggestionGroup({
  group,
  selectedIds,
  onToggle,
}: QuestionSuggestionGroupProps) {
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.title}>
        {group.title}
      </Text>
      <View style={styles.list}>
        {group.questions.map((question) => (
          <SuggestedQuestionRow
            key={question.questionId}
            text={question.text}
            checked={selectedIds.includes(question.questionId)}
            onToggle={() => onToggle(question.questionId)}
            accessibilityLabel={getSuggestionLabel(question.text)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.light.text,
  },
  list: {
    gap: Spacing.half,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
