import { StyleSheet } from 'react-native';

import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

/** Shared look for the labelled form fields (text, select, date and time). */
export const fieldStyles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: Colors.light.onSurface,
  },
  optional: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
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
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
  placeholder: {
    color: Colors.light.textSecondary,
  },
  error: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: Colors.light.error,
  },
});
