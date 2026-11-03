import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';

import { SectionLabel } from './SectionLabel';

function Chip({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <View
      style={[styles.chip, !allowed && styles.chipDisabled]}
      accessible
      accessibilityLabel={`${label}: ${allowed ? 'allowed' : 'not allowed'}`}
    >
      <AppText variant="labelSmall" color={allowed ? 'primary' : 'textDisabled'} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/**
 * "YOUR PERMISSIONS" with the two access chips. A permission the patient hasn't given is greyed out
 * (Figma 3911-25051).
 */
export function PermissionChips({ canAddQuestions, canAddAnswers }: { canAddQuestions: boolean; canAddAnswers: boolean }) {
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

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  chip: {
    flex: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surfaceContainer,
  },
  chipDisabled: {
    backgroundColor: Colors.light.surfaceGrouped,
  },
});
