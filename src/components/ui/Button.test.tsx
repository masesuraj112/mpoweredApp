import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';

import { Button } from './Button';

function pillOf(label: string) {
  // The visible shape is the view inside the touch target.
  const pill = screen.getByRole('button', { name: label }).children[0];
  if (typeof pill === 'string') throw new Error('Expected the pill view inside the button.');
  return StyleSheet.flatten(pill.props.style);
}

describe('Button', () => {
  it('presses and announces its label', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses a longer spoken label when given one', async () => {
    await render(<Button label="Edit" accessibilityLabel="Edit My Pain" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Edit My Pain' })).toBeTruthy();
  });

  it('cannot be pressed when disabled', async () => {
    await render(<Button label="Save" disabled onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('is a rounded rectangle for primary and outlined, and a pill when asked', async () => {
    const { rerender } = await render(<Button label="Go" variant="primary" onPress={jest.fn()} />);
    expect(pillOf('Go').borderRadius).toBe(Radius.control);

    await rerender(<Button label="Go" variant="primary" pill onPress={jest.fn()} />);
    expect(pillOf('Go').borderRadius).toBe(Radius.pill);

    await rerender(<Button label="Go" variant="outlined" pill onPress={jest.fn()} />);
    expect(pillOf('Go').borderRadius).toBe(Radius.pill);
  });

  it('keeps tonal buttons pill shaped', async () => {
    await render(<Button label="Edit" variant="tonal" onPress={jest.fn()} />);

    expect(pillOf('Edit').borderRadius).toBe(Radius.pill);
  });
});
