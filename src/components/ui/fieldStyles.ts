import { StyleSheet } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

/** Shared look for the labelled form fields (text, select, date and time). */
export const fieldStyles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.light.onSurface,
  },
  optional: {
    ...Typography.labelMedium,
    color: Colors.light.textSecondary,
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
    borderColor: Colors.light.outline,
    borderRadius: Radius.control - 2,
    backgroundColor: Colors.light.background,
  },
  boxError: {
    borderColor: Colors.light.error,
    borderWidth: 2,
  },
  value: {
    flex: 1,
    minWidth: 0,
    ...Typography.bodyLarge,
    color: Colors.light.onSurface,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
  error: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: Colors.light.error,
  },
});
