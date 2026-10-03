import { SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { Image } from 'expo-image';
import { Children, Fragment, ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

const pencilIcon = require('../../../assets/images/settings/pencil.svg');

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
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
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
            <Text style={styles.errorText} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {errorMessage}
            </Text>
          )}
          <View style={styles.actions}>
            {!hideCancel && (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={cancelLabel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onConfirm ?? onClose}
              disabled={confirmDisabled}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: confirmDisabled }}
              style={[styles.confirmButton, confirmDisabled && styles.confirmButtonDisabled]}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Plain body copy for message-style popups (e.g. "Your password has been changed."). */
export function SettingsModalText({ children }: { children: ReactNode }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

/* -------------------------------------------------------------------------- */
/*  Text field                                                                 */
/* -------------------------------------------------------------------------- */

type SettingsModalFieldProps = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
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
      <Text style={styles.fieldLabel}>{label}</Text>
      {/* Caller props come after the password defaults, so they can still override them. */}
      <TextInput
        {...passwordProps}
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        style={styles.fieldInput}
        accessibilityLabel={label}
      />
      {password ? (
        <Pressable
          onPress={() => setRevealed(current => !current)}
          accessibilityRole="button"
          accessibilityLabel={`${revealed ? 'Hide' : 'Show'} ${label}`}
          hitSlop={8}
          style={styles.revealButton}
        >
          <Text style={styles.revealText}>{revealed ? 'Hide' : 'Show'}</Text>
        </Pressable>
      ) : (
        showEditIcon && (
          <Image source={pencilIcon} style={styles.editIcon} contentFit="contain" accessibilityLabel="" pointerEvents="none" />
        )
      )}
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
      <Text style={styles.sectionTitle}>{title}</Text>
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
          {index > 0 && <View style={styles.divider} />}
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
      <Text style={styles.rowLabel}>{label}</Text>
      <SettingsToggle value={value} onValueChange={onValueChange} accessibilityLabel={label} />
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
      <Text style={[styles.rowLabel, destructive && styles.destructiveText]}>{label}</Text>
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
      <Text style={styles.inlineLabel}>{label}</Text>
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
    padding: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  card: {
    width: '100%',
    maxWidth: 386,
    maxHeight: '90%',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 0,
  },
  title: {
    marginBottom: 18,
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginBottom: 4,
    color: '#D32F2F',
    fontSize: 12,
    lineHeight: 16,
  },
  bodyText: {
    marginBottom: 16,
    color: '#1D1B20',
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 24,
    marginTop: 4,
  },
  cancelButton: {
    minWidth: 54,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#6750A4',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    width: 105,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#6750A4',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#FEF7FF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Text field
  field: {
    height: 58,
    marginBottom: 16,
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: '#E6E0E9',
    paddingHorizontal: 16,
  },
  fieldLabel: {
    color: '#49454F',
    fontSize: 12,
    lineHeight: 16,
  },
  fieldInput: {
    height: 26,
    padding: 0,
    paddingRight: 44,
    color: '#1D1B20',
    fontSize: 16,
  },
  editIcon: {
    position: 'absolute',
    right: 16,
    top: 17,
    width: 24,
    height: 24,
  },
  revealButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  revealText: {
    color: '#6750A4',
    fontSize: 14,
    fontWeight: '600',
  },

  // Sections, groups, rows
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  group: {
    borderWidth: 1,
    borderColor: '#AEAEB2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
    backgroundColor: '#CAC4D0',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },
  rowLabel: {
    flex: 1,
    color: '#1D1B20',
    fontSize: 16,
    lineHeight: 24,
  },
  destructiveText: {
    color: '#D32F2F',
  },
  rowIcon: {
    width: 24,
    height: 24,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    zIndex: 2,
  },
  inlineLabel: {
    color: '#1D1B20',
    fontSize: 20,
    lineHeight: 24,
  },
});
