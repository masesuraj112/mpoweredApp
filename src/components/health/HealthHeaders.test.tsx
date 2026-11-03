import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrescriptionsHeader } from './PrescriptionsHeader';
import { TrackingScreenHeader } from './TrackingScreenHeader';

jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn(), replace: jest.fn() } }));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { router } = require('expo-router') as { router: { dismissTo: jest.Mock; replace: jest.Mock } };

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

function inProvider(node: React.ReactNode) {
  return <SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>;
}

beforeEach(() => jest.clearAllMocks());

describe('PrescriptionsHeader', () => {
  it('shows the page title as a heading and the optional top bar label and actions', async () => {
    await render(
      inProvider(
        <PrescriptionsHeader
          title="My Pain Profiles"
          topBarLabel="Homescreen"
          titleAccessory={<Text>Edit</Text>}
        />,
      ),
    );

    expect(screen.getByRole('header', { name: 'My Pain Profiles' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Homescreen' })).toBeTruthy();
    expect(screen.getByText('Edit')).toBeTruthy();
  });

  it('goes back to the start of My Health, however deep the stack is', async () => {
    await render(inProvider(<PrescriptionsHeader title="My Prescriptions" />));

    await fireEvent.press(screen.getByRole('button', { name: 'Back to My Health' }));

    expect(router.dismissTo).toHaveBeenCalledWith('/health');
  });
});

describe('TrackingScreenHeader', () => {
  it('marks the current tab as selected', async () => {
    await render(inProvider(<TrackingScreenHeader activeTab="history" />));

    expect(screen.getByRole('tab', { name: 'History', selected: true })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Chart', selected: false })).toBeTruthy();
  });

  it('switches to the other tab, and does nothing on the current one', async () => {
    await render(inProvider(<TrackingScreenHeader activeTab="chart" />));

    await fireEvent.press(screen.getByRole('tab', { name: 'Chart' }));
    expect(router.replace).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('tab', { name: 'History' }));
    expect(router.replace).toHaveBeenCalledWith('/health/tracking/history');
  });

  it('prints the PDF from the chip', async () => {
    const onPrintPdf = jest.fn();
    await render(inProvider(<TrackingScreenHeader activeTab="chart" onPrintPdf={onPrintPdf} />));

    await fireEvent.press(screen.getByRole('button', { name: 'Print PDF' }));

    expect(onPrintPdf).toHaveBeenCalledTimes(1);
  });

  it('disables the chip when there is nothing to print and while a PDF is being made', async () => {
    const { rerender } = await render(inProvider(<TrackingScreenHeader activeTab="chart" />));
    expect(screen.getByRole('button', { name: 'Print PDF' })).toBeDisabled();

    await rerender(inProvider(<TrackingScreenHeader activeTab="chart" onPrintPdf={jest.fn()} printing />));
    expect(screen.getByRole('button', { name: 'Print PDF' })).toBeDisabled();
    expect(screen.getByLabelText('Creating PDF')).toBeTruthy();
  });

  it('goes back to the start of My Health', async () => {
    await render(inProvider(<TrackingScreenHeader activeTab="chart" />));

    await fireEvent.press(screen.getByRole('button', { name: 'Back' }));

    expect(router.dismissTo).toHaveBeenCalledWith('/health');
  });
});
