import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChipButton } from '@/components/ui/ChipButton';
import type { ProfileSection } from '@/features/health-profile/profile';

import { Dropdown } from './Dropdown';
import { ProfileSectionCard } from './ProfileSectionCard';

describe('Dropdown', () => {
  const options = [
    { value: 'mg', label: 'mg' },
    { value: 'g', label: 'g' },
  ];

  it('is the platform picker, named for screen readers with the chosen value', async () => {
    await render(<Dropdown value="mg" options={options} onChange={jest.fn()} accessibilityLabel="Strength unit" />);

    expect(screen.getByLabelText('Strength unit')).toBeTruthy();
    expect(screen.getByRole('menuitem', { name: 'mg', selected: true })).toBeTruthy();
  });

  it('picks another option from the menu', async () => {
    const onChange = jest.fn();
    await render(<Dropdown value="mg" options={options} onChange={onChange} accessibilityLabel="Strength unit" />);

    await fireEvent.press(screen.getByRole('menuitem', { name: 'g' }));

    expect(onChange).toHaveBeenCalledWith('g');
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
