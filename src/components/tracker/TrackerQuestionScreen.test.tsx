import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TrackerQuestionScreen } from './TrackerQuestionScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

async function setup() {
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <TrackerQuestionScreen title="My Movement">
        <Text>Question card</Text>
      </TrackerQuestionScreen>
    </SafeAreaProvider>,
  );
}

describe('TrackerQuestionScreen', () => {
  it('shows the tracker name as the page heading above the question', async () => {
    await setup();

    expect(screen.getByRole('header', { name: 'My Movement' })).toBeTruthy();
    expect(screen.getByText('Question card')).toBeTruthy();
  });

  it('closes the keyboard when the page is tapped outside a text box', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    await setup();

    fireEvent.press(screen.getByText('Question card'));

    expect(dismiss).toHaveBeenCalled();
  });
});
