import { Stack } from 'expo-router';
import type { ReactNode } from 'react';

type ScreenHeaderProps = {
  /** Accepted for main's callers; the platform's back button goes back. */
  onBack?: () => void;
  /** The text beside the platform's back arrow (iOS). */
  backLabel?: string;
  /** The page title, shown in the platform's header bar. */
  title?: string;
  /** Accepted for main's callers; the platform's header pads for the status bar itself. */
  padForStatusBar?: boolean;
  /** Extra content under the bar, such as a title row or tabs. It sits at the top of the page. */
  children?: ReactNode;
};

/**
 * A page's header: its title goes in the platform's own header bar (set up in the section's layout), and
 * anything else (actions, tabs) sits at the top of the page under it.
 */
export function ScreenHeader({ backLabel, title, children }: ScreenHeaderProps) {
  const options = {
    ...(title !== undefined && { title }),
    ...(backLabel !== undefined && { headerBackTitle: backLabel }),
  };
  return (
    <>
      {Object.keys(options).length > 0 && <Stack.Screen options={options} />}
      {children}
    </>
  );
}
