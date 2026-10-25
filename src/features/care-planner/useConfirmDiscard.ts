import { usePreventRemove } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

/**
 * Asks "Discard?" before the screen is left while `dirty` is true. It covers the on-screen Back
 * button, hardware back and swipe back, because the router blocks the removal and reports it.
 *
 * Returns `allowLeave`: call it just before leaving on purpose (for example after a successful
 * save) so that the question is not asked.
 */
export function useConfirmDiscard(dirty: boolean, title: string, message: string): () => void {
  const [leaveAllowed, setLeaveAllowed] = useState(false);

  const disablePrevention = usePreventRemove(dirty && !leaveAllowed, ({ repeat }) => {
    Alert.alert(title, message, [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setLeaveAllowed(true);
          repeat();
        },
      },
    ]);
  });

  return () => {
    setLeaveAllowed(true);
    disablePrevention();
  };
}
