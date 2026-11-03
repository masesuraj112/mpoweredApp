import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { setTextScale } from '@/constants/theme';

/** The app's text size, on top of the phone's own text size setting. */
export type TextSizeChoice = 'default' | 'large' | 'extraLarge';

/** Saved on this device only, like Appearance: a display preference, not account data. */
const TEXT_SIZE_KEY = '@mpowered/text-size';

export const TEXT_SIZE_LABELS: Record<TextSizeChoice, string> = {
  default: 'Default',
  large: 'Large',
  extraLarge: 'Extra large',
};

/** Only larger than the type scale: it is already no smaller than 14, and should stay that way. */
export const TEXT_SIZE_SCALES: Record<TextSizeChoice, number> = {
  default: 1,
  large: 1.15,
  extraLarge: 1.3,
};

function isTextSizeChoice(value: unknown): value is TextSizeChoice {
  return value === 'default' || value === 'large' || value === 'extraLarge';
}

export async function loadTextSize(): Promise<TextSizeChoice> {
  try {
    const saved = await AsyncStorage.getItem(TEXT_SIZE_KEY);
    return isTextSizeChoice(saved) ? saved : 'default';
  } catch {
    return 'default';
  }
}

/** Applies the saved size. Called once as the app starts, while the splash screen is still showing. */
export async function restoreTextSize(): Promise<void> {
  setTextScale(TEXT_SIZE_SCALES[await loadTextSize()]);
}

/** The Display page's text size setting: applies at once and is remembered on this device. */
export function useTextSize() {
  const [choice, setChoiceState] = useState<TextSizeChoice>('default');

  useEffect(() => {
    let isCurrent = true;
    void loadTextSize().then((saved) => {
      if (isCurrent) setChoiceState(saved);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const setChoice = (next: TextSizeChoice) => {
    setChoiceState(next);
    setTextScale(TEXT_SIZE_SCALES[next]);
    // Not saving only means the size resets next time the app opens.
    void AsyncStorage.setItem(TEXT_SIZE_KEY, next).catch(() => undefined);
  };

  return { choice, setChoice };
}
