import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Appearance } from 'react-native';

import { loadAppearance, restoreAppearance, useAppearance } from './appearance';

const KEY = '@mpowered/appearance';

describe('appearance', () => {
  let setColorScheme: jest.SpyInstance;

  beforeEach(async () => {
    await AsyncStorage.clear();
    setColorScheme = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
  });

  afterEach(() => setColorScheme.mockRestore());

  it('follows the phone until something is chosen, and ignores a value it does not know', async () => {
    expect(await loadAppearance()).toBe('system');

    await AsyncStorage.setItem(KEY, 'sepia');
    expect(await loadAppearance()).toBe('system');
  });

  it('applies a saved choice as the app starts, and leaves the phone setting alone otherwise', async () => {
    await restoreAppearance();
    expect(setColorScheme).not.toHaveBeenCalled();

    await AsyncStorage.setItem(KEY, 'dark');
    await restoreAppearance();
    expect(setColorScheme).toHaveBeenCalledWith('dark');
  });

  it('applies a new choice at once and remembers it', async () => {
    const { result } = await renderHook(() => useAppearance());

    await act(async () => result.current.setChoice('light'));

    expect(result.current.choice).toBe('light');
    expect(setColorScheme).toHaveBeenLastCalledWith('light');
    await waitFor(async () => expect(await AsyncStorage.getItem(KEY)).toBe('light'));
  });

  it('goes back to following the phone', async () => {
    await AsyncStorage.setItem(KEY, 'dark');
    const { result } = await renderHook(() => useAppearance());
    await waitFor(() => expect(result.current.choice).toBe('dark'));

    await act(async () => result.current.setChoice('system'));

    expect(setColorScheme).toHaveBeenLastCalledWith('auto');
  });
});
