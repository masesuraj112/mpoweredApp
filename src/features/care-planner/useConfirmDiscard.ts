import { useNavigation } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';

/**
 * Asks "Discard?" before the screen is left while `dirty` is true. It covers the on-screen Back
 * button, hardware back and swipe back, because it listens for the navigation `beforeRemove` event.
 *
 * Returns `allowLeave`: call it just before leaving on purpose (for example after a successful
 * save) so that the question is not asked.
 */
export function useConfirmDiscard(dirty: boolean, title: string, message: string): () => void {
  const navigation = useNavigation();
  const leaveAllowed = useRef(false);

  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (leaveAllowed.current || !dirty) return;
      event.preventDefault();
      Alert.alert(title, message, [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            leaveAllowed.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });
  }, [navigation, dirty, title, message]);

  return () => {
    leaveAllowed.current = true;
  };
}
