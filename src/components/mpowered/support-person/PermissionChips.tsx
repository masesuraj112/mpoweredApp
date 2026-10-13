import { Colors } from '@/constants/theme';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from './SectionLabel';

function Chip({ label, allowed }: { label: string; allowed: boolean }) {
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
    gap: scaleHeight(7),
  },
  row: {
    flexDirection: 'row',
    gap: scaleWidth(20),
  },
  chip: {
    flex: 1,
    height: scaleHeight(23),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: Colors.light.surfaceContainer,
  },
  chipDisabled: {
    backgroundColor: '#F2F2F7',
  },
  chipText: {
    color: Colors.light.primary,
    fontSize: scaleFont(11),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  chipTextDisabled: {
    color: Colors.light.outline,
  },
});
