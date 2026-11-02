import { MinTapTarget, Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

/** Shared text and field styles for the sign-in and sign-up steps, so every step reads the same. */
export const useAuthStyles = makeStyles((colors) => ({
  title: {
    ...Typography.title,
    color: colors.text,
    textAlign: 'center',
  },
  lead: {
    ...Typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  error: {
    ...Typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
  },
  input: {
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control,
    backgroundColor: colors.surface,
    ...Typography.bodyLarge,
    color: colors.text,
  },
  inputValid: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
}));
