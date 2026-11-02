

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
    borderRadius: Radius.control - 2,
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
  boxError: {
    borderBottomColor: colors.error,
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
