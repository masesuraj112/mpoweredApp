import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrescriptionsHeader } from './PrescriptionsHeader';
import { TrackingScreenHeader } from './TrackingScreenHeader';

const mockScreenOptions = jest.fn();
jest.mock('expo-router', () => ({
  router: { dismissTo: jest.fn(), replace: jest.fn() },
  Stack: { Screen: ({ options }: { options: object }) => (mockScreenOptions(options), null) },
}));
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
  it('puts the page title in the native header and shows the actions under it', async () => {
    await render(inProvider(<PrescriptionsHeader title="My Pain Profiles" titleAccessory={<Text>Edit</Text>} />));

    expect(mockScreenOptions).toHaveBeenLastCalledWith({ title: 'My Pain Profiles' });
    expect(screen.getByText('Edit')).toBeTruthy();
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

  it('puts the title in the native header', async () => {
    await render(inProvider(<TrackingScreenHeader activeTab="chart" />));

    expect(mockScreenOptions).toHaveBeenLastCalledWith({ title: 'My Health Tracking Records' });
  });
});
