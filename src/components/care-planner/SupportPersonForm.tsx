import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { PhoneIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/TextField';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import type {
  SupportPersonDraft,
  SupportPersonErrors,
} from '@/features/care-planner/supportPerson';

type SupportPersonFormProps = {
  draft: SupportPersonDraft;
  errors: SupportPersonErrors;
  onChange: (patch: Partial<SupportPersonDraft>) => void;
  onBlurField: (field: keyof SupportPersonErrors) => void;
};

// Labels and placeholders copied exactly from the Figma design.
export function SupportPersonForm({ draft, errors, onChange, onBlurField }: SupportPersonFormProps) {
  return (
    <View style={styles.form}>
      <TextField
        label="Support person’s name"
        placeholder="support person name"
        value={draft.name}
        onChangeText={(name) => onChange({ name })}
        onBlur={() => onBlurField('name')}
        error={errors.name}
        autoCapitalize="words"
        textContentType="name"
        autoComplete="name"
      />

      <TextField
        label="Support person’s phone number"
        placeholder="Phone number"
        value={draft.phone}
        onChangeText={(phone) => onChange({ phone })}
        onBlur={() => onBlurField('phone')}
        error={errors.phone}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoCapitalize="none"
        autoCorrect={false}
        trailingIcon={<PhoneIcon />}
      />

      <TextField
        label="Support person’s e-mail"
        hint="optional"
        placeholder="email address"
        value={draft.email}
        onChangeText={(email) => onChange({ email })}
        onBlur={() => onBlurField('email')}
        error={errors.email}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.access}>
        <Text accessibilityRole="header" style={styles.accessLabel}>
          Access type
        </Text>
        <View style={styles.accessList}>
          <Checkbox
            label="Add questions"
            checked={draft.canAddQuestions}
            onChange={(canAddQuestions) => onChange({ canAddQuestions })}
            style={styles.accessRow}
          />
          <View style={styles.divider} />
          <Checkbox
            label="Add doctor’s answer"
            checked={draft.canAddAnswers}
            onChange={(canAddAnswers) => onChange({ canAddAnswers })}
            style={styles.accessRow}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.four,
  },
  access: {
    gap: Spacing.two,
  },
  accessLabel: {
    ...Typography.labelLarge,
    color: Colors.light.onSurface,
  },
  accessList: {
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.control + 2,
    paddingHorizontal: Spacing.three,
  },
  accessRow: {
    paddingVertical: Spacing.two,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.outlineStrong,
  },
});
