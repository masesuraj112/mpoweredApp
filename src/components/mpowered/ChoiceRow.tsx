import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';

const CONTROL_SIZE = 24;

type ChoiceRowProps = {
  label: string;
  /** A smaller second line, for example a medication's dose. */
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
  /** `radio`: pick one. `checkbox`: pick any. */
  kind: 'radio' | 'checkbox';
  /** The last row has no divider under it. */
  isLast?: boolean;
  /** Spoken label, when it should differ from the visible one. */
  accessibilityLabel?: string;
};

/** One answer in an assessment list: the control on the left, then the label. Grows with its text. */
export function ChoiceRow({
  label,
  supportingText,
  selected,
  onPress,
  kind,
  isLast = false,
  accessibilityLabel,
}: ChoiceRowProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={kind}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.row, !isLast && styles.divider, pressed && styles.pressed]}>
      {kind === 'radio' ? (
        <View style={[styles.control, styles.radio, selected && styles.controlSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      ) : (
        <View style={[styles.control, styles.checkbox, selected && styles.checkboxSelected]}>
          {/* A fixed-size box, so the tick must not grow with the text size; the label still does. */}
          {selected && (
            <Text allowFontScaling={false} style={styles.tick}>
              ✓
            </Text>
          )}
        </View>
      )}
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {supportingText ? <Text style={styles.supportingText}>{supportingText}</Text> : null}
      </View>
    </Pressable>
  );
}

/** The box that holds a question's answers. */
export function ChoiceList({ children, testID }: { children: ReactNode; testID?: string }) {
  const styles = useStyles();
  return (
    <View testID={testID} style={styles.list}>
      {children}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: {
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: {
    backgroundColor: colors.backgroundElement,
  },
  control: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderWidth: 2,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radio: {
    borderRadius: Radius.pill,
  },
  checkbox: {
    borderRadius: 6,
  },
  controlSelected: {
    borderColor: colors.controlChecked,
  },
  checkboxSelected: {
    borderColor: colors.controlChecked,
    backgroundColor: colors.controlChecked,
  },
  radioDot: {
    width: CONTROL_SIZE / 2,
    height: CONTROL_SIZE / 2,
    borderRadius: Radius.pill,
    backgroundColor: colors.controlChecked,
  },
  tick: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.half,
  },
  label: {
    ...Typography.bodyLarge,
    color: colors.text,
  },
  supportingText: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
}));
