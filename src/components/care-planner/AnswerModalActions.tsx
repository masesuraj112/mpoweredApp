import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { ArrowGlyph } from '@/components/ui/icons';

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
  const styles = useStyles();
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
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
      style={styles.stepTarget}>
      <View style={[styles.step, enabled ? styles.stepEnabled : styles.stepDisabled]}>
        <ArrowGlyph
          direction={glyph === '←' ? 'left' : 'right'}
          style={[styles.glyph, enabled ? styles.glyphEnabled : styles.glyphDisabled]}
        />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
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
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  stepEnabled: {
    backgroundColor: colors.primary,
  },
  stepDisabled: {
    backgroundColor: colors.primaryContainer,
  },
  glyph: {
    color: colors.text,
    ...Typography.subtitle,
  },
  glyphEnabled: {
    color: colors.onPrimary,
  },
  glyphDisabled: {
    color: colors.outlineStrong,
  },
}));
