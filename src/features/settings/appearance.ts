import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

/** Follow the phone's light or dark setting, or always use one. */
export type AppearanceChoice = 'system' | 'light' | 'dark';

/** Saved on this device only: it is a display preference, not account data, so it outlives a sign-out. */
const APPEARANCE_KEY = '@mpowered/appearance';

export const APPEARANCE_LABELS: Record<AppearanceChoice, string> = {
  system: 'Match phone',
  light: 'Light',
  dark: 'Dark',
};

function isAppearanceChoice(value: unknown): value is AppearanceChoice {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Switches the whole app, the platform's headers, tabs and pickers included. */
function applyAppearance(choice: AppearanceChoice) {
  Appearance.setColorScheme(choice === 'system' ? 'auto' : choice);
}

export async function loadAppearance(): Promise<AppearanceChoice> {
  try {
    const saved = await AsyncStorage.getItem(APPEARANCE_KEY);
    return isAppearanceChoice(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

/** Applies the saved choice. Called once as the app starts, while the splash screen is still showing. */
export async function restoreAppearance(): Promise<void> {
  const choice = await loadAppearance();
  if (choice !== 'system') applyAppearance(choice);
}

/** The Display page's appearance setting: applies at once and is remembered on this device. */
export function useAppearance() {
  const [choice, setChoiceState] = useState<AppearanceChoice>('system');

  useEffect(() => {
    let isCurrent = true;
    void loadAppearance().then((saved) => {
      if (isCurrent) setChoiceState(saved);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const setChoice = (next: AppearanceChoice) => {
    setChoiceState(next);
    applyAppearance(next);
    // Not saving only means the choice resets next time the app opens.
    void AsyncStorage.setItem(APPEARANCE_KEY, next).catch(() => undefined);
  };

  return { choice, setChoice };
}
