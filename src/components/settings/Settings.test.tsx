import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { signOut } from '@/services/auth';

import { SettingsHome, type SettingsRowProps } from './SettingsHome';
import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalInfoRow,
  SettingsModalToggleRow,
} from './SettingsModal';
import { SettingsOption, SettingsSelect, SettingsToggle } from './SettingsSubpage';

jest.mock('@/services/auth', () => ({ signOut: jest.fn() }));

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

describe('SettingsHome', () => {
  beforeEach(() => jest.clearAllMocks());

  const home = (rows: SettingsRowProps[] = [{ icon: '👤', label: 'Account', onPress: jest.fn() }]) => (
    <SafeAreaProvider initialMetrics={metrics}>
      <SettingsHome rows={rows} />
    </SafeAreaProvider>
  );

  it('shows the title and a button for each row', async () => {
    const onPress = jest.fn();
    await render(home([{ icon: '👤', label: 'Account', onPress }]));

    expect(screen.getByRole('header', { name: 'Settings' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Account' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables a row that goes nowhere', async () => {
    await render(home([{ icon: '👤', label: 'Coming soon' }]));

    expect(screen.getByRole('button', { name: 'Coming soon' })).toBeDisabled();
  });

  it('signs out', async () => {
    (signOut as jest.Mock).mockResolvedValue({ ok: true, data: undefined });
    await render(home());

    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('tells the person when signing out fails', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (signOut as jest.Mock).mockResolvedValue({ ok: false, error: { message: 'No connection.' } });
    await render(home());

    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(alert).toHaveBeenCalledWith('Sign out failed', 'No connection.');
  });
});

describe('SettingsModal', () => {
  it('confirms and cancels', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    await render(
      <SettingsModal visible title="Personal details" onClose={onClose} onConfirm={onConfirm}>
        <SettingsModalInfoRow label="Phone" value="0400 000 000" />
      </SettingsModal>,
    );

    expect(screen.getByRole('header', { name: 'Personal details' })).toBeTruthy();
    expect(screen.getByLabelText('Phone: 0400 000 000')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ok' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Ok when there is nothing to confirm, and can hide Cancel', async () => {
    const onClose = jest.fn();
    await render(
      <SettingsModal visible title="Done" onClose={onClose} hideCancel>
        {null}
      </SettingsModal>,
    );

    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Ok' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cannot be confirmed while disabled, and shows an error message', async () => {
    await render(
      <SettingsModal visible title="T" onClose={jest.fn()} confirmDisabled errorMessage="Name is required.">
        {null}
      </SettingsModal>,
    );

    expect(screen.getByRole('button', { name: 'Ok' })).toBeDisabled();
    expect(screen.getByRole('alert', { name: 'Name is required.' })).toBeTruthy();
  });

  it('renders nothing while not visible', async () => {
    await render(
      <SettingsModal visible={false} title="Hidden" onClose={jest.fn()}>
        {null}
      </SettingsModal>,
    );

    expect(screen.queryByText('Hidden')).toBeNull();
  });
});

describe('SettingsModalField', () => {
  function Harness({ password = false }: { password?: boolean }) {
    const [value, setValue] = useState('');
    return <SettingsModalField label="Password" value={value} onChangeText={setValue} password={password} />;
  }

  it('reports what is typed', async () => {
    await render(<Harness />);

    await fireEvent.changeText(screen.getByLabelText('Password'), 'hello');

    expect(screen.getByLabelText('Password').props.value).toBe('hello');
  });

  it('hides a password until Show is pressed', async () => {
    await render(<Harness password />);
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Show Password' }));

    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
    expect(screen.getByRole('button', { name: 'Hide Password' })).toBeTruthy();
  });
});

describe('Settings rows', () => {
  it('toggles a switch', async () => {
    const onValueChange = jest.fn();
    await render(<SettingsToggle value={false} onValueChange={onValueChange} accessibilityLabel="Reminders" />);

    expect(screen.getByRole('switch', { name: 'Reminders', checked: false })).toBeTruthy();
    await fireEvent.press(screen.getByRole('switch', { name: 'Reminders' }));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('toggles from a modal row too', async () => {
    const onValueChange = jest.fn();
    await render(
      <SettingsModalGroup>
        <SettingsModalToggleRow label="Add questions" value onValueChange={onValueChange} />
        <SettingsModalActionRow label="Revoke all access" destructive onPress={jest.fn()} />
      </SettingsModalGroup>,
    );

    await fireEvent.press(screen.getByRole('switch', { name: 'Add questions' }));

    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: 'Revoke all access' })).toBeTruthy();
  });

  it('is the platform picker: names itself and picks an option', async () => {
    const onChange = jest.fn();
    await render(<SettingsSelect value="Small" options={['Small', 'Large']} onChange={onChange} />);

    expect(screen.getByLabelText('Text size')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'Small', selected: true })).toBeTruthy();
    await fireEvent.press(screen.getByRole('menuitem', { name: 'Large' }));

    expect(onChange).toHaveBeenCalledWith('Large');
  });

  it('is a button only when it goes somewhere', async () => {
    const { rerender } = await render(<SettingsOption label="Privacy" onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Privacy' })).toBeTruthy();

    await rerender(<SettingsOption label="Privacy" />);
    expect(screen.queryByRole('button', { name: 'Privacy' })).toBeNull();
  });
});
