import { Text, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import type { SuggestedQuestionGroup } from '@/features/care-planner/suggestionTypes';

type QuestionPreviewGroupProps = {
  group: SuggestedQuestionGroup;
};

/** A heading and its questions as plain text: nothing here can be ticked or edited. */
export function QuestionPreviewGroup({ group }: QuestionPreviewGroupProps) {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  group: {
    gap: Spacing.two,
  },
  title: {
    ...Typography.labelLarge,
    color: colors.text,
  },
  list: {
    gap: Spacing.half,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  question: {
    ...Typography.bodyLarge,
    color: colors.onSurface,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.backgroundElement,
  },
}));
