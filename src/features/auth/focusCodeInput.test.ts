import { focusCodeInput, type FocusableInput } from './focusCodeInput';

function fakeInput(focused: boolean) {
  const calls: string[] = [];
  const input: FocusableInput = {
    isFocused: () => focused,
    focus: () => calls.push('focus'),
    blur: () => calls.push('blur'),
  };
  return { input, calls };
}

describe('focusCodeInput', () => {
  it('focuses an input that is not focused', () => {
    const { input, calls } = fakeInput(false);

    focusCodeInput(input);

    expect(calls).toEqual(['focus']);
  });

  it('blurs then focuses an input that kept focus after the keyboard closed, so the keyboard reopens', () => {
    const { input, calls } = fakeInput(true);
    let later: (() => void) | undefined;

    focusCodeInput(input, (run) => {
      later = run;
    });
    expect(calls).toEqual(['blur']);

    later?.();
    expect(calls).toEqual(['blur', 'focus']);
  });

  it('waits a moment before focusing again by default', () => {
    jest.useFakeTimers();
    const { input, calls } = fakeInput(true);

    focusCodeInput(input);
    expect(calls).toEqual(['blur']);
    jest.advanceTimersByTime(50);
    expect(calls).toEqual(['blur', 'focus']);
    jest.useRealTimers();
  });

  it('does nothing before the input exists', () => {
    expect(() => focusCodeInput(null)).not.toThrow();
  });
});
