import { Image } from 'expo-image';
import { Children, Fragment, useState, type ReactNode } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { SettingsToggle } from '@/components/settings/SettingsSubpage';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

const pencilIcon = require('../../../assets/images/settings/pencil.svg');

const ICON_SIZE = 24;

/* -------------------------------------------------------------------------- */
/*  Shell                                                                      */
/* -------------------------------------------------------------------------- */

type SettingsModalProps = {
  visible: boolean;
  title: string;
  /** Called on Cancel and on the Android back button. */
  onClose: () => void;
  /** Called on Ok. Defaults to `onClose`, so a purely informational popup needs no extra wiring. */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  /** Hide the Cancel button (e.g. for a confirm-only popup). */
  hideCancel?: boolean;
  /** Small red message shown directly above the Cancel / Ok buttons. Hidden when empty. */
  errorMessage?: string;
  /**
   * Wrap the content in a ScrollView so tall popups (e.g. Manage support person) fit small screens.
   * Leave off for popups containing a SettingsSelect: a ScrollView would clip its dropdown menu.
   */
  scrollable?: boolean;
  children?: ReactNode;
};

/**
 * Shared popup used by the settings screens: dimmed overlay, white card,
 * title, content area, and Cancel / Ok actions. Height follows the content.
 *
 * Content building blocks (all exported below):
 *   SettingsModalField       – labelled text input (optional `password` mode)
 *   SettingsModalSection     – bold heading above a block of content
 *   SettingsModalGroup       – bordered card that stacks rows with dividers
 *   SettingsModalToggleRow   – label + switch (use inside a Group)
 *   SettingsModalActionRow   – tappable row, optionally destructive with a trailing icon
 *   SettingsModalInfoRow     – read-only label with a short value on the right
 *   SettingsModalInlineRow   – "Every [3 ▾] [days ▾]" style row
 */
export function SettingsModal({
  visible,
  title,
  onClose,
  onConfirm,
  confirmLabel = 'Ok',
  cancelLabel = 'Cancel',
  confirmDisabled = false,
  hideCancel = false,
  errorMessage,
  scrollable = false,
  children,
}: SettingsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Tapping the card closes the keyboard: number pads have no key for it (see SettingsModalField). */}
        <Pressable style={styles.card} onPress={Keyboard.dismiss} accessible={false}>
          <AppText accessibilityRole="header" variant="labelLargeBold" color="text" style={styles.title}>
            {title}
          </AppText>
          {scrollable ? (
            <ScrollView
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            children
          )}
          {!!errorMessage && (
            <AppText
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              variant="bodySmall"
              color="error"
              style={styles.errorText}
            >
              {errorMessage}
            </AppText>
          )}
          <View style={styles.actions}>
            {!hideCancel && (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
                style={styles.cancelButton}
              >
                <AppText variant="labelLargeBold" color="primary">
                  {cancelLabel}
                </AppText>
              </Pressable>
            )}
            <Button
              label={confirmLabel}
              variant="primary"
              disabled={confirmDisabled}
              onPress={onConfirm ?? onClose}
              style={confirmDisabled && styles.confirmDisabled}
            />
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

/** Plain body copy for message-style popups (e.g. "Your password has been changed."). */
export function SettingsModalText({ children }: { children: ReactNode }) {
  return (
    <AppText variant="bodyLarge" color="onSurface" style={styles.bodyText}>
      {children}
    </AppText>
  );
}

/* -------------------------------------------------------------------------- */
/*  Text field                                                                 */
/* -------------------------------------------------------------------------- */

type SettingsModalFieldProps = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  /** Leave out for a read-only field (pass `editable={false}` and `showEditIcon={false}` too). */
  onChangeText?: (value: string) => void;
  /**
   * Password mode: hides the text, turns off auto-capitalise / auto-correct, sets the
   * password autofill hints, and swaps the pencil icon for a Show / Hide toggle.
   */
  password?: boolean;
  /** Show the pencil icon on the right (ignored in password mode). Defaults to true. */
  showEditIcon?: boolean;
};

/** Labelled text input styled for use inside `SettingsModal`. */
export function SettingsModalField({
  label,
  value,
  onChangeText,
  password = false,
  showEditIcon = true,
  ...inputProps
}: SettingsModalFieldProps) {
  const [revealed, setRevealed] = useState(false);

  const passwordProps: TextInputProps = password
    ? {
        secureTextEntry: !revealed,
        autoCapitalize: 'none',
        autoCorrect: false,
        textContentType: 'password',
        autoComplete: 'password',
      }
    : {};

  return (
    <View style={styles.field}>
      <AppText variant="bodySmall" color="onSurfaceVariant">
        {label}
      </AppText>
      <View style={styles.fieldRow}>
        {/* Caller props come after the password defaults, so they can still override them. */}
        {/* No keyboard Done bar (inputAccessoryViewID) here: in testing on iPhone, inside a Modal no
            keyboard opened with it. Text keyboards close with their Done key; number pads close
            by tapping the popup card (SettingsModal). */}
        <TextInput
          returnKeyType="done"
          {...passwordProps}
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          style={styles.fieldInput}
          accessibilityLabel={label}
        />
        {password ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={`${revealed ? 'Hide' : 'Show'} ${label}`}
            style={styles.revealButton}
          >
            <AppText variant="labelLargeBold" color="primary">
              {revealed ? 'Hide' : 'Show'}
            </AppText>
          </Pressable>
        ) : (
          showEditIcon && (
            <Image
              source={pencilIcon}
              style={styles.editIcon}
              contentFit="contain"
              accessibilityLabel=""
              pointerEvents="none"
            />
          )
        )}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sections, groups and rows                                                  */
/* -------------------------------------------------------------------------- */

/** Bold heading above a block of content, e.g. "Access permissions". */
export function SettingsModalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText accessibilityRole="header" variant="labelLargeBold" color="text" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Bordered card that stacks its children as rows, with a divider between each. */
export function SettingsModalGroup({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.group}>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 && <Divider style={styles.divider} />}
          {row}
        </Fragment>
      ))}
    </View>
  );
}

/** Label with a switch on the right. Intended for use inside `SettingsModalGroup`. */
export function SettingsModalToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <AppText variant="bodyLarge" color="onSurface" style={styles.rowLabel}>
        {label}
      </AppText>
      <SettingsToggle value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

/** Read-only label with a short grey value on the right, e.g. a permission the user can't change. */
export function SettingsModalInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
      <AppText variant="bodyLarge" color="onSurface" style={styles.rowLabel}>
        {label}
      </AppText>
      <AppText variant="bodyMediumRegular" color="onSurfaceVariant">
        {value}
      </AppText>
    </View>
  );
}

/**
 * Tappable row with an optional icon on the right (e.g. the trash icon on "Revoke all access").
 * `destructive` turns the label red. Intended for use inside `SettingsModalGroup`.
 */
export function SettingsModalActionRow({
  label,
  onPress,
  icon,
  destructive = false,
}: {
  label: string;
  onPress: () => void;
  /** An `require(...)`d image asset, same as `SettingsOption`. */
  icon?: number;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <AppText variant="bodyLarge" color={destructive ? 'error' : 'onSurface'} style={styles.rowLabel}>
        {label}
      </AppText>
      {icon && <Image source={icon} style={styles.rowIcon} contentFit="contain" accessibilityLabel="" />}
    </Pressable>
  );
}

/**
 * A label followed by inline controls on one line, e.g.
 *   <SettingsModalInlineRow label="Every"> <SettingsSelect …/> <SettingsSelect …/> </SettingsModalInlineRow>
 * Sits above the Cancel / Ok buttons so open dropdown menus draw on top of them.
 */
export function SettingsModalInlineRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.inlineRow}>
      <AppText variant="bodyLarge" color="onSurface">
        {label}
      </AppText>
      {children}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.mid,
    backgroundColor: Colors.light.backdrop,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flexGrow: 0,
  },
  title: {
    marginBottom: Spacing.three,
  },
  errorText: {
    marginBottom: Spacing.one,
  },
  bodyText: {
    marginBottom: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  cancelButton: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDisabled: {
    opacity: 0.5,
  },

  // Text field
  field: {
    minHeight: MinTapTarget + Spacing.mid,
    marginBottom: Spacing.three,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.small,
    backgroundColor: Colors.light.surfaceContainer,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  fieldInput: {
    ...Typography.bodyLarge,
    flex: 1,
    minHeight: Spacing.five,
    padding: 0,
    color: Colors.light.onSurface,
  },
  editIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  revealButton: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    // The field already has padding around it; pull the target in so the field does not grow.
    marginVertical: -Spacing.two,
  },

  // Sections, groups, rows
  section: {
    marginTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    marginBottom: Spacing.mid,
  },
  group: {
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  divider: {
    marginHorizontal: Spacing.mid,
  },
  row: {
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.mid,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    flex: 1,
  },
  rowIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.three,
    zIndex: 2,
  },
});
