import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SummaryReport } from './SummaryReport';
import { SummaryStatus } from './SummaryStatus';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 0 },
};

function inProvider(node: React.ReactNode) {
  return <SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>;
}

const baseProps = {
  title: 'My Movement',
  period: '2 Nov to 8 Nov',
  intro: 'This helps guide your treatment.',
  savedText: 'Saved to My Health',
  onClose: jest.fn(),
};

describe('SummaryReport', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the page heading, report title, period and saved note', async () => {
    await render(inProvider(<SummaryReport {...baseProps} />));

    expect(screen.getByRole('header', { name: 'My Pain Summary' })).toBeTruthy();
    expect(screen.getByText('My Movement')).toBeTruthy();
    expect(screen.getByText('Period: 2 Nov to 8 Nov')).toBeTruthy();
    expect(screen.getByText('This helps guide your treatment.')).toBeTruthy();
    expect(screen.getByText('Saved to My Health')).toBeTruthy();
  });

  it('closes from the Close button', async () => {
    await render(inProvider(<SummaryReport {...baseProps} />));

    await fireEvent.press(screen.getByRole('button', { name: 'Close summary' }));

    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('reopens the questions from Edit answers', async () => {
    const onEdit = jest.fn();
    await render(inProvider(<SummaryReport {...baseProps} onEdit={onEdit} />));

    await fireEvent.press(screen.getByRole('button', { name: 'Edit answers' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('leaves out Edit answers when the entry cannot be edited', async () => {
    await render(inProvider(<SummaryReport {...baseProps} />));

    expect(screen.queryByRole('button', { name: 'Edit answers' })).toBeNull();
  });

  it('lists each result under "My results:"', async () => {
    await render(
      inProvider(
        <SummaryReport
          {...baseProps}
          results={[
            { heading: 'Walking:', value: 'No response recorded.' },
            { heading: 'Lifting:', value: 'Some difficulty.' },
          ]}
        />,
      ),
    );

    expect(screen.getByText('My results:')).toBeTruthy();
    expect(screen.getByText('Walking:')).toBeTruthy();
    expect(screen.getByText('Some difficulty.')).toBeTruthy();
  });

  it('opens the tips link as a link', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(
      inProvider(
        <SummaryReport
          {...baseProps}
          guidance="Keep moving."
          tips={{ label: 'Explore tips on managing movement', url: 'https://example.org/tips' }}
        />,
      ),
    );

    await fireEvent.press(screen.getByRole('link', { name: 'Explore tips on managing movement' }));

    expect(screen.getByText('Keep moving.')).toBeTruthy();
    expect(openURL).toHaveBeenCalledWith('https://example.org/tips');
  });

  it('leaves out the summary panel and results when there are none', async () => {
    await render(inProvider(<SummaryReport {...baseProps} />));

    expect(screen.queryByText('Summary')).toBeNull();
    expect(screen.queryByText('My results:')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows extra sections under the results', async () => {
    await render(
      inProvider(
        <SummaryReport {...baseProps}>
          <Text>Extra section</Text>
        </SummaryReport>,
      ),
    );

    expect(screen.getByText('Extra section')).toBeTruthy();
  });
});

describe('SummaryStatus', () => {
  it('shows a labelled spinner while loading', async () => {
    await render(inProvider(<SummaryStatus state={{ status: 'loading' }} onClose={jest.fn()} />));

    expect(screen.getByLabelText('Loading your summary')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('uses the loading label it is given', async () => {
    await render(
      inProvider(
        <SummaryStatus state={{ status: 'loading' }} onClose={jest.fn()} loadingLabel="Loading your answers" />,
      ),
    );

    expect(screen.getByLabelText('Loading your answers')).toBeTruthy();
  });

  it('shows the error as an alert with a Close button', async () => {
    const onClose = jest.fn();
    await render(
      inProvider(
        <SummaryStatus state={{ status: 'error', message: 'We could not find your saved entry.' }} onClose={onClose} />,
      ),
    );

    expect(screen.getByRole('alert', { name: 'We could not find your saved entry.' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Close summary' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
