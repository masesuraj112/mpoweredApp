

import { MinTapTarget, Radius, Spacing, makeStyles } from '@/constants/theme';

/** Shared look for the labelled form fields (text, select, date and time). */
export const useFieldStyles = makeStyles((colors) => ({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: colors.onSurface,
  },
  optional: {
    fontSize: 12,
    lineHeight: 16,
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
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: colors.onSurface,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: colors.error,
  },
}));
