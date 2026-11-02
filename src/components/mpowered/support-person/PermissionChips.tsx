import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Text, View } from 'react-native';

import { SectionLabel } from './SectionLabel';

function Chip({ label, allowed }: { label: string; allowed: boolean }) {
  const styles = useStyles();
  return (
    <View
      style={[styles.chip, !allowed && styles.chipDisabled]}
      accessible
      accessibilityLabel={`${label}: ${allowed ? 'allowed' : 'not allowed'}`}
    >
      <Text style={[styles.chipText, !allowed && styles.chipTextDisabled]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/**
 * "YOUR PERMISSIONS" with the two access chips. A permission the patient hasn't given is greyed out
 * (Figma 3911-25051).
 */
export function PermissionChips({ canAddQuestions, canAddAnswers }: { canAddQuestions: boolean; canAddAnswers: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <SectionLabel>Your permissions</SectionLabel>
      <View style={styles.row}>
        <Chip label="Add Questions" allowed={canAddQuestions} />
        <Chip label="Add Doctor's Answer" allowed={canAddAnswers} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: colors.surfaceContainer,
    paddingVertical: Spacing.two,
  },
  chipDisabled: {
    backgroundColor: colors.background,
  },
  chipText: {
    color: colors.primary,
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chipTextDisabled: {
    color: colors.textDisabled,
  },
}));
