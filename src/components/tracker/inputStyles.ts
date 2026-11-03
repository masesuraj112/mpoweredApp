import { MinTapTarget, Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

/** The one text field look for assessments: search boxes, scores and typed answers. */
export const useInputStyles = makeStyles((colors) => ({
  input: {
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.control,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
    backgroundColor: colors.surface,
    ...Typography.bodyLarge,
    color: colors.text,
  },
  /** A box for a few sentences. */
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
}));
