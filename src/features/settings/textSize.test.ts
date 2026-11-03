import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { makeStyles, setTextScale } from '@/constants/theme';

import { loadTextSize, restoreTextSize, TEXT_SIZE_SCALES, useTextSize } from './textSize';

const KEY = '@mpowered/text-size';
const useSample = makeStyles((colors) => ({
  label: { fontSize: 20, lineHeight: 26, color: colors.text },
  box: { padding: 8 },
}));

describe('text size', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setTextScale(1);
  });

  it('is the default until something is chosen, and ignores a value it does not know', async () => {
    expect(await loadTextSize()).toBe('default');

    await AsyncStorage.setItem(KEY, 'tiny');
    expect(await loadTextSize()).toBe('default');
  });

  it('only ever makes text bigger', () => {
    for (const scale of Object.values(TEXT_SIZE_SCALES)) expect(scale).toBeGreaterThanOrEqual(1);
  });

  it('applies a saved size as the app starts', async () => {
    await AsyncStorage.setItem(KEY, 'extraLarge');
    await restoreTextSize();

    const { result } = await renderHook(() => useSample());
    expect(result.current.label.fontSize).toBe(26);
  });

  it('grows text styles at once, leaving everything else alone, and remembers the choice', async () => {
    const { result: size } = await renderHook(() => useTextSize());
    const { result: styles } = await renderHook(() => useSample());
    expect(styles.current.label).toMatchObject({ fontSize: 20, lineHeight: 26 });

    await act(async () => size.current.setChoice('large'));

    expect(size.current.choice).toBe('large');
    expect(styles.current.label).toMatchObject({ fontSize: 23, lineHeight: 30 });
    expect(styles.current.box).toEqual({ padding: 8 });
    await waitFor(async () => expect(await AsyncStorage.getItem(KEY)).toBe('large'));
  });
});
