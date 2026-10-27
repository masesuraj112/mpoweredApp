jest.mock('@/services/care-planner', () => ({
  listMySupportPersons: jest.fn(),
  saveSupportPerson: jest.fn(),
  deleteSupportPerson: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
  deleteSupportPerson,
  listMySupportPersons,
  saveSupportPerson,
} from '@/services/care-planner';

import type { SupportPerson } from './types';
import { useMySupportPersons } from './useMySupportPersons';

const mockList = listMySupportPersons as jest.Mock;
const mockSave = saveSupportPerson as jest.Mock;
const mockDelete = deleteSupportPerson as jest.Mock;

const bron: SupportPerson = {
  supportPersonId: 4,
  name: 'Bron',
  phone: '+61411111111',
  email: null,
  canAddQuestions: true,
  canAddAnswers: false,
};

async function setup() {
  const hook = await renderHook(() => useMySupportPersons());
  await waitFor(() => expect(hook.result.current.state.status).not.toBe('loading'));
  return hook;
}

beforeEach(() => {
  mockList.mockReset().mockResolvedValue({ ok: true, data: [bron] });
  mockSave.mockReset();
  mockDelete.mockReset();
});

describe('useMySupportPersons', () => {
  it('loads the patient’s support people', async () => {
    const { result } = await setup();
    expect(result.current.state).toEqual({ status: 'ready', data: [bron] });
  });

  it('shows an error when the list cannot be loaded, and reloads on retry', async () => {
    mockList.mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const { result } = await setup();
    expect(result.current.state.status).toBe('error');

    await act(async () => result.current.reload());
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
  });

  it('saves a person and reads the list again', async () => {
    mockSave.mockResolvedValue({ ok: true, data: bron });
    const { result } = await setup();
    let saved = false;
    await act(async () => {
      saved = await result.current.save(bron);
    });
    expect(saved).toBe(true);
    expect(mockSave).toHaveBeenCalledWith(bron);
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    expect(result.current.busy).toBe(false);
    expect(result.current.actionError).toBeNull();
  });

  it('keeps the error, and does not reload, when a save fails', async () => {
    const error = { code: 'VALIDATION', message: 'DUPLICATE_SUPPORT_PERSON', detail: 'DUPLICATE_SUPPORT_PERSON' };
    mockSave.mockResolvedValue({ ok: false, error });
    const { result } = await setup();
    let saved = true;
    await act(async () => {
      saved = await result.current.save(bron);
    });
    expect(saved).toBe(false);
    expect(result.current.actionError).toEqual(error);
    expect(mockList).toHaveBeenCalledTimes(1);

    await act(async () => result.current.clearActionError());
    expect(result.current.actionError).toBeNull();
  });

  it('deletes a person by id and reads the list again', async () => {
    mockDelete.mockResolvedValue({ ok: true, data: undefined });
    const { result } = await setup();
    let removed = false;
    await act(async () => {
      removed = await result.current.remove(4);
    });
    expect(removed).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith(4);
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
  });

  it('keeps the error when a delete fails', async () => {
    mockDelete.mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const { result } = await setup();
    let removed = true;
    await act(async () => {
      removed = await result.current.remove(4);
    });
    expect(removed).toBe(false);
    expect(result.current.actionError).toMatchObject({ code: 'NETWORK' });
  });
});
