import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  Host,
  Text,
  TextField,
  type TextFieldRef,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth, menuAnchor, onVisibilityChanged, semantics } from '@expo/ui/jetpack-compose/modifiers';
import { useEffect, useRef, useState } from 'react';

import { useThemeColors } from '@/constants/theme';
import type { NativePickerProps } from './NativePicker';

/**
 * Android: the Material dropdown, built from the same pieces as `@expo/ui`'s universal Picker so its field
 * can take the app's input colours (the universal one is always Material grey). See NativePicker.tsx.
 */
export function NativePicker<T extends string>({ value, options, onChange, accessibilityLabel, style }: NativePickerProps<T>) {
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const field = useRef<TextFieldRef>(null);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  // The field is uncontrolled, so push the chosen label into it once it is on screen.
  useEffect(() => {
    if (isVisible) void field.current?.setText(selectedLabel);
  }, [selectedLabel, isVisible]);

  return (
    // A Material dropdown fills whatever width it is given, so the picker only takes its height from its
    // contents and fills its parent's width.
    <Host matchContents={{ vertical: true }} seedColor={colors.primary} style={[{ alignSelf: 'stretch' }, style]}>
      <ExposedDropdownMenuBox expanded={expanded} onExpandedChange={setExpanded}>
        <TextField
          ref={field}
          readOnly
          colors={{
            focusedContainerColor: colors.surfaceContainer,
            unfocusedContainerColor: colors.surfaceContainer,
            focusedTextColor: colors.text,
            unfocusedTextColor: colors.text,
            focusedIndicatorColor: colors.primary,
            unfocusedIndicatorColor: colors.outline,
            focusedTrailingIconColor: colors.primary,
            unfocusedTrailingIconColor: colors.onSurfaceVariant,
          }}
          modifiers={[
            menuAnchor(),
            fillMaxWidth(),
            onVisibilityChanged(setIsVisible),
            ...(accessibilityLabel ? [semantics({ contentDescription: accessibilityLabel })] : []),
          ]}
        />
        <ExposedDropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setExpanded(false);
              }}>
              <DropdownMenuItem.Text>
                <Text>{option.label}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </ExposedDropdownMenu>
      </ExposedDropdownMenuBox>
    </Host>
  );
}
