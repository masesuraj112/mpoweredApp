import { act, renderHook } from '@testing-library/react-native';

import { useMinimumDuration } from './useMinimumDuration';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useMinimumDuration', () => {
  it('is false until the time has passed, then true', async () => {
    const { result } = await renderHook(() => useMinimumDuration(3000, true));

    await act(async () => jest.advanceTimersByTime(2999));
    expect(result.current).toBe(false);

    await act(async () => jest.advanceTimersByTime(1));
    expect(result.current).toBe(true);
  });

  it('only starts counting once started', async () => {
    const { result, rerender } = await renderHook(({ start }: { start: boolean }) => useMinimumDuration(3000, start), {
      initialProps: { start: false },
    });

    await act(async () => jest.advanceTimersByTime(5000));
    expect(result.current).toBe(false);

    await rerender({ start: true });
    await act(async () => jest.advanceTimersByTime(3000));
    expect(result.current).toBe(true);
  });
});
