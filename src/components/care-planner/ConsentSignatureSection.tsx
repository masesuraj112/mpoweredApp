import { StyleSheet, Text, View } from 'react-native';

import { SignaturePad } from '@/components/ui/SignaturePad';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { SignatureData } from '@/features/care-planner/signature';

type ConsentSignatureSectionProps = {
  signature: SignatureData | null;
  onChange: (signature: SignatureData | null) => void;
  onDrawStart: () => void;
  onDrawEnd: () => void;
  disabled?: boolean;
};

// Wording copied exactly from the Figma design.
const SIGNATURE_LABEL = 'Doctor’s signature';
const CONSENT_STATEMENT =
  'By giving my signature, I agree for patient’s to record today’s consultation';

export function ConsentSignatureSection({
  signature,
  onChange,
  onDrawStart,
  onDrawEnd,
  disabled,
}: ConsentSignatureSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{SIGNATURE_LABEL}</Text>
      <SignaturePad
        value={signature}
        onChange={onChange}
        onDrawStart={onDrawStart}
        onDrawEnd={onDrawEnd}
        disabled={disabled}
        accessibilityLabel={SIGNATURE_LABEL}
        accessibilityHint="Draw the signature in this box with a finger or stylus"
      />
      <Text style={styles.statement}>{CONSENT_STATEMENT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.light.onSurface,
  },
  statement: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
