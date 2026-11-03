import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ChipButton } from '@/components/ui/ChipButton';
import type { ProfileSection } from '@/features/health-profile/profile';

import { Dropdown } from './Dropdown';
import { HealthSubpage } from './HealthSubpage';
import { ProfileSectionCard } from './ProfileSectionCard';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

describe('Dropdown', () => {
  const options = [
    { value: 'mg', label: 'mg' },
    { value: 'g', label: 'g' },
  ];

  it('names the control and its chosen value for screen readers', async () => {
    await render(<Dropdown value="mg" options={options} onChange={jest.fn()} accessibilityLabel="Strength unit" />);

    expect(screen.getByRole('button', { name: 'Strength unit, mg' })).toBeTruthy();
  });

  it('opens a list, marks the current option, and picks another one', async () => {
    const onChange = jest.fn();
    await render(<Dropdown value="mg" options={options} onChange={onChange} accessibilityLabel="Strength unit" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Strength unit, mg' }));
    expect(screen.getByRole('radio', { name: 'mg', checked: true })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'g' }));

    expect(onChange).toHaveBeenCalledWith('g');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('closes without changing when the backdrop is tapped', async () => {
    const onChange = jest.fn();
    await render(<Dropdown value="mg" options={options} onChange={onChange} accessibilityLabel="Strength unit" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Strength unit, mg' }));
    // The list is a modal view, so the backdrop is hidden from screen readers (they close it with the system gesture).
    await fireEvent.press(screen.getByRole('button', { name: 'Close list', includeHiddenElements: true }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('shows the raw value when it matches no option', async () => {
    await render(<Dropdown value="ml" options={options} onChange={jest.fn()} accessibilityLabel="Strength unit" />);

    expect(screen.getByText('ml')).toBeTruthy();
  });
});

describe('ChipButton', () => {
  it('presses when enabled', async () => {
    const onPress = jest.fn();
    await render(<ChipButton label="Share" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Share' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('cannot be pressed when disabled', async () => {
    await render(<ChipButton label="Share" disabled onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Share' })).toBeDisabled();
  });

  it('shows a labelled spinner instead of the text while busy', async () => {
    await render(<ChipButton label="Print PDF" busy busyLabel="Creating PDF" disabled onPress={jest.fn()} />);

    expect(screen.getByLabelText('Creating PDF')).toBeTruthy();
    expect(screen.queryByText('Print PDF')).toBeNull();
  });
});

describe('ProfileSectionCard', () => {
  const complete: ProfileSection = {
    id: 'pain',
    title: 'My Pain',
    period: '2 Nov to 8 Nov',
    complete: true,
    variant: 'detail',
    items: [{ label: 'Worst pain', value: '7' }],
  } as ProfileSection;

  it('shows the title, the answers and the period when asked', async () => {
    await render(<ProfileSectionCard section={complete} showPeriod />);

    expect(screen.getByRole('header', { name: 'My Pain' })).toBeTruthy();
    expect(screen.getByText('Worst pain')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('Period: 2 Nov to 8 Nov')).toBeTruthy();
    expect(screen.queryByText('Incomplete')).toBeNull();
  });

  it('shows an Incomplete badge and its message instead of answers', async () => {
    await render(
      <ProfileSectionCard
        section={{ ...complete, complete: false, incompleteMessage: 'Not completed yet.', items: [] } as ProfileSection}
      />,
    );

    expect(screen.getByText('Incomplete')).toBeTruthy();
    expect(screen.getByText('Not completed yet.')).toBeTruthy();
    expect(screen.queryByText('Worst pain')).toBeNull();
  });
});

describe('HealthSubpage', () => {
  it('shows the header above the content', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <HealthSubpage header={<Text>The header</Text>}>
          <Text>The content</Text>
        </HealthSubpage>
      </SafeAreaProvider>,
    );

    expect(screen.getByText('The header')).toBeTruthy();
    expect(screen.getByText('The content')).toBeTruthy();
  });
});
