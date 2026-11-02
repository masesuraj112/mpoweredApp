

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

/** Shared look for the labelled form fields (text, select, date and time). */
export const useFieldStyles = makeStyles((colors) => ({
  container: {
    gap: Spacing.one,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: colors.onSurface,
  },
  optional: {
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  box: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control - 2,
    backgroundColor: colors.background,
  },
  boxError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  value: {
    flex: 1,
    minWidth: 0,
    ...Typography.bodyLarge,
    letterSpacing: 0.5,
    color: colors.onSurface,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  error: {
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: colors.error,
  },
}));
