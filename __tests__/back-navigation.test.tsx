import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';

jest.mock('expo-router', () => ({
  router: { dismissTo: jest.fn(), replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  Stack: { Screen: () => null },
}));
const mockRouter = jest.requireMock('expo-router').router;

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

describe('Back to Home in the tracker', () => {
  it('returns to the Home screen already open, instead of opening a copy of it', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <AssessmentHeader />
      </SafeAreaProvider>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Back to Home' }));

    expect(mockRouter.dismissTo).toHaveBeenCalledWith('/home');
    expect(mockRouter.replace).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
