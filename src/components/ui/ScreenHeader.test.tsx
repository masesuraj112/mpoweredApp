import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenHeader } from './ScreenHeader';

const mockScreenOptions = jest.fn();
jest.mock('expo-router', () => ({
  Stack: { Screen: ({ options }: { options: object }) => (mockScreenOptions(options), null) },
}));

describe('ScreenHeader', () => {
  beforeEach(() => mockScreenOptions.mockClear());

  it('puts the title and back label in the native header', async () => {
    await render(<ScreenHeader onBack={jest.fn()} title="Summary" backLabel="History" />);

    expect(mockScreenOptions).toHaveBeenLastCalledWith({ title: 'Summary', headerBackTitle: 'History' });
  });

  it('leaves the header alone when given nothing for it', async () => {
    await render(<ScreenHeader onBack={jest.fn()} />);

    expect(mockScreenOptions).not.toHaveBeenCalled();
  });

  it('shows what sits under the bar on the page', async () => {
    await render(
      <ScreenHeader onBack={jest.fn()} title="Records">
        <Text>Tabs</Text>
      </ScreenHeader>,
    );

    expect(screen.getByText('Tabs')).toBeTruthy();
  });
});
