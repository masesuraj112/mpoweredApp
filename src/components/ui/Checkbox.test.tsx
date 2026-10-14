import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import {
  Checkbox,
  CHECKBOX_BORDER_WIDTH,
  CHECKBOX_BOX_SIZE,
  CHECKBOX_RADIUS,
  CHECKBOX_TICK_SIZE,
} from './Checkbox';

function Harness({ onChange }: { onChange?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      label="I agree"
      checked={checked}
      onChange={(next) => {
        setChecked(next);
        onChange?.(next);
      }}
    />
  );
}

describe('Checkbox', () => {
  it('toggles and exposes the checked state', async () => {
    const onChange = jest.fn();
    await render(<Harness onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'I agree' });
    expect(checkbox).toBeEnabled();
    expect(screen.queryByTestId('checkbox-tick')).toBeNull();

    await fireEvent.press(checkbox);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('checkbox', { name: 'I agree', checked: true })).toBeTruthy();
    expect(screen.getByTestId('checkbox-tick')).toBeTruthy();

    await fireEvent.press(checkbox);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('checkbox-tick')).toBeNull();
  });

  it('draws the tick inside the box with room to spare', async () => {
    await render(<Checkbox label="I agree" checked onChange={() => {}} />);

    const box = StyleSheet.flatten(screen.getByTestId('checkbox-box').props.style);
    const tick = StyleSheet.flatten(screen.getByTestId('checkbox-tick').props.style);

    // Same numbers as the default checkbox in MultiChoiceList.
    expect(box.width).toBe(24);
    expect(box.height).toBe(24);
    expect(box.borderWidth).toBe(2);
    expect(box.borderRadius).toBe(6);
    expect(tick.fontSize).toBe(14);
    expect(tick.fontWeight).toBe('700');

    const inner = CHECKBOX_BOX_SIZE - 2 * CHECKBOX_BORDER_WIDTH;
    expect(inner).toBe(20);
    expect(CHECKBOX_TICK_SIZE).toBeLessThan(inner);
    expect(CHECKBOX_RADIUS).toBeLessThan(CHECKBOX_BOX_SIZE / 2);
    expect(screen.getByTestId('checkbox-box').props.style).not.toEqual(
      expect.objectContaining({ overflow: 'hidden' }),
    );
    expect(screen.getByTestId('checkbox-tick').props.allowFontScaling).toBe(false);
  });

  it('does not toggle when disabled', async () => {
    const onChange = jest.fn();
    await render(<Checkbox label="I agree" checked={false} disabled onChange={onChange} />);

    await fireEvent.press(screen.getByRole('checkbox', { name: 'I agree' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
