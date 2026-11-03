import { renderHook, waitFor } from '@testing-library/react-native';

import { fail, ok, type Result } from '@/lib/result';

import { useWeekSummary } from './useWeekSummary';

type Entry = { score: number };

const toSummary = (entry: Entry) => `score ${entry.score}`;
const errorMessage = () => 'Could not load.';

function setup(weekStart: string | undefined, load: (week: string) => Promise<Result<Entry | null>>) {
  return renderHook(() => useWeekSummary({ weekStart, load, toSummary, errorMessage }));
}

describe('useWeekSummary', () => {
  it('starts out loading', async () => {
    const { result } = await setup('2026-11-02', () => new Promise(() => {}));

    expect(result.current).toEqual({ status: 'loading' });
  });

  it('turns the saved entry into a summary', async () => {
    const load = jest.fn().mockResolvedValue(ok({ score: 7 }));
    const { result } = await setup('2026-11-02', load);

    await waitFor(() => expect(result.current).toEqual({ status: 'ready', summary: 'score 7' }));
    expect(load).toHaveBeenCalledWith('2026-11-02');
  });

  it('reports a failed load with the caller’s message', async () => {
    const error = { code: 'network', message: 'offline' } as never;
    const { result } = await setup('2026-11-02', () => Promise.resolve(fail(error)));

    await waitFor(() => expect(result.current).toEqual({ status: 'error', message: 'Could not load.' }));
  });

  it('says so when no entry was saved for the week', async () => {
    const { result } = await setup('2026-11-02', () => Promise.resolve(ok(null)));

    await waitFor(() =>
      expect(result.current).toEqual({ status: 'error', message: 'We could not find your saved entry.' }),
    );
  });

  it('shows an error without loading when there is no week', async () => {
    const load = jest.fn();
    const { result } = await setup(undefined, load);

    expect(result.current).toEqual({ status: 'error', message: 'We could not find the week to show.' });
    expect(load).not.toHaveBeenCalled();
  });

  it('ignores a result that arrives after the screen has gone', async () => {
    let finish: (value: Result<Entry | null>) => void = () => {};
    const load = () => new Promise<Result<Entry | null>>((resolve) => (finish = resolve));
    const { result, unmount } = await setup('2026-11-02', load);

    await unmount();
    finish(ok({ score: 1 }));

    expect(result.current).toEqual({ status: 'loading' });
  });
});
