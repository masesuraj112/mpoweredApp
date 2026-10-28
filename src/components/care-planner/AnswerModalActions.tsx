import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

type AnswerModalActionsProps = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
};

export function AnswerModalActions({
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onCancel,
  onSave,
  saving,
}: AnswerModalActionsProps) {
  return (
    <View style={styles.row}>
      <View style={styles.arrows}>
        <StepButton label="Previous question" glyph="←" enabled={canGoPrevious} onPress={onPrevious} />
        <StepButton label="Next question" glyph="→" enabled={canGoNext} onPress={onNext} />
      </View>
      <View style={styles.buttons}>
        <Button
          label="Cancel"
          accessibilityLabel="Cancel"
          variant="outlined"
          disabled={saving}
          onPress={onCancel}
        />
        <Button
          label={saving ? 'Saving…' : 'OK'}
          accessibilityLabel={saving ? 'Saving answer' : 'Save answer'}
          variant="primary"
          disabled={saving}
          onPress={onSave}
        />
      </View>
    </View>
  );
}

type StepButtonProps = {
  label: string;
  glyph: string;
  enabled: boolean;
  onPress: () => void;
};

function StepButton({ label, glyph, enabled, onPress }: StepButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={styles.stepTarget}>
      <View style={[styles.step, enabled ? styles.stepEnabled : styles.stepDisabled]}>
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[styles.glyph, enabled ? styles.glyphEnabled : styles.glyphDisabled]}>
          {glyph}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepTarget: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.outline,
  },
  stepEnabled: {
    backgroundColor: Colors.light.primary,
  },
  stepDisabled: {
    backgroundColor: Colors.light.primaryContainer,
  },
  glyph: {
    fontSize: 18,
    lineHeight: 22,
  },
  glyphEnabled: {
    color: Colors.light.onPrimary,
  },
  glyphDisabled: {
    color: Colors.light.outlineStrong,
  },
});
