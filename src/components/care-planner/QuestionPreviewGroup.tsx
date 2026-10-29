import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing, Typography } from '@/constants/theme';
import type { SuggestedQuestionGroup } from '@/features/care-planner/suggestionTypes';

type QuestionPreviewGroupProps = {
  group: SuggestedQuestionGroup;
};

/** A heading and its questions as plain text: nothing here can be ticked or edited. */
export function QuestionPreviewGroup({ group }: QuestionPreviewGroupProps) {
  return (
    <View style={styles.group}>
      <Text accessibilityRole="header" style={styles.title}>
        {group.title}
      </Text>
      <View style={styles.list}>
        {group.questions.map((question) => (
          <Text key={question.questionId} style={styles.question}>
            {question.text}
          </Text>
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
  question: {
    ...Typography.bodyLarge,
    color: Colors.light.onSurface,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
  },
});
