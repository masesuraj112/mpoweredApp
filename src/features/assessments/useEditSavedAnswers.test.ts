import { renderHook, waitFor } from '@testing-library/react-native';

import { fail, ok, type Result } from '@/lib/result';

import { useEditSavedAnswers } from './useEditSavedAnswers';

type Entry = { score: number };

const toAnswers = (entry: Entry) => ({ score: entry.score });
const errorMessage = () => 'Could not load.';

async function setup(load: (week: string) => Promise<Result<Entry | null>>, isHydrated = true) {
  const replaceAnswers = jest.fn();
  const onReady = jest.fn();
  const hook = await renderHook(
    ({ hydrated }: { hydrated: boolean }) =>
      useEditSavedAnswers({
        load,
        toAnswers,
        isHydrated: hydrated,
        replaceAnswers,
        onReady,
        errorMessage,
        // a Thursday, so the week starts on Monday 2026-10-26
        today: '2026-10-29',
      }),
    { initialProps: { hydrated: isHydrated } },
  );
  return { ...hook, replaceAnswers, onReady };
}

describe('useEditSavedAnswers', () => {
  it('puts this week’s saved answers in place, then opens the first question', async () => {
    const load = jest.fn().mockResolvedValue(ok({ score: 7 }));
    const { replaceAnswers, onReady } = await setup(load);

    await waitFor(() => expect(onReady).toHaveBeenCalledTimes(1));
    expect(load).toHaveBeenCalledWith('2026-10-26');
    expect(replaceAnswers).toHaveBeenCalledWith({ score: 7 });
    expect(replaceAnswers.mock.invocationCallOrder[0]).toBeLessThan(onReady.mock.invocationCallOrder[0]);
  });

  it('waits for the local draft before loading', async () => {
    const load = jest.fn().mockResolvedValue(ok({ score: 7 }));
    const { rerender, onReady } = await setup(load, false);

    expect(load).not.toHaveBeenCalled();
    await rerender({ hydrated: true });
    await waitFor(() => expect(onReady).toHaveBeenCalled());
  });

  it('reports a failed load with the caller’s message and does not open the questions', async () => {
    const error = { code: 'NETWORK', message: 'offline' } as never;
    const { result, onReady, replaceAnswers } = await setup(() => Promise.resolve(fail(error)));

    await waitFor(() => expect(result.current).toEqual({ status: 'error', message: 'Could not load.' }));
    expect(onReady).not.toHaveBeenCalled();
    expect(replaceAnswers).not.toHaveBeenCalled();
  });

  it('says so when nothing was saved this week', async () => {
    const { result, onReady } = await setup(() => Promise.resolve(ok(null)));

    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'error',
        message: 'We could not find your saved answers for this week.',
      }),
    );
    expect(onReady).not.toHaveBeenCalled();
  });
});
