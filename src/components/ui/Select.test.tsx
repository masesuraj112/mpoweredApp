import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { Select } from './Select';

const OPTIONS = [{ label: 'Physiotherapist' }, { label: 'Rheumatologist' }];

function Harness() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Select
      label="Health services"
      hint="optional"
      placeholder="Select healthcare practitioner service"
      options={OPTIONS}
      value={value}
      onChange={setValue}
      clearable
    />
  );
}

// The first render loads react-native-svg and the Modal, which can exceed the 5s default when cold.
jest.setTimeout(30000);

describe('Select', () => {
  it('opens, chooses an option, shows it as selected and clears it', async () => {
    await render(<Harness />);

    const field = screen.getByRole('button', { name: 'Health services, optional' });
    expect(screen.getByText('Select healthcare practitioner service')).toBeTruthy();
    expect(field.props.accessibilityState).toEqual(expect.objectContaining({ expanded: false }));

    await fireEvent.press(field);
    expect(
      screen.getByRole('button', { name: 'Health services, optional' }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ expanded: true }));
    expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();

    await fireEvent.press(screen.getByRole('radio', { name: 'Rheumatologist' }));
    expect(screen.getByText('Rheumatologist')).toBeTruthy();
    expect(screen.queryByText('Select healthcare practitioner service')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Health services, optional' }));
    expect(screen.getByRole('radio', { name: 'Rheumatologist', selected: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Physiotherapist', selected: false })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByText('Select healthcare practitioner service')).toBeTruthy();
  });
});
