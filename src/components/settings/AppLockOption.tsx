import { useState } from 'react';
import { Alert } from 'react-native';

import { useAppLock } from '@/features/app-lock/AppLockContext';

import { SettingsOption, SettingsToggle } from './SettingsSubpage';

const faceIdIcon = require('../../../assets/images/settings/faceid.svg');

/**
 * The Account settings switch for the app lock. Turning it on asks the phone to check it is its owner
 * first, so nobody turns on a lock they cannot get past.
 */
export function AppLockOption() {
  const { enabled, setEnabled, methodName } = useAppLock();
  const [busy, setBusy] = useState(false);
  const label = `Unlock with ${methodName}`;

  const toggle = async (on: boolean) => {
    if (busy) return;
    setBusy(true);
    const message = await setEnabled(on);
    setBusy(false);
    if (message) Alert.alert('Could not turn on the app lock', message);
  };

  return (
    <SettingsOption
      icon={faceIdIcon}
      label={label}
      accessibilityLabel={`${label}, ${enabled ? 'on' : 'off'}`}
      trailing={<SettingsToggle value={enabled} onValueChange={toggle} accessibilityLabel={label} />}
    />
  );
}
