jest.mock('@/services/profile', () => ({
  getPersonalDetails: jest.fn(),
  updateProfile: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';

import { getPersonalDetails, updateProfile } from '@/services/profile';

import { usePersonalDetails } from './usePersonalDetails';

const mockGet = getPersonalDetails as jest.Mock;
const mockUpdate = updateProfile as jest.Mock;

const sam = { name: 'Sam', phone: '+61491570006', yearOfBirth: 1980 };

async function setup() {
  const hook = await renderHook(() => usePersonalDetails());
  await waitFor(() => expect(hook.result.current.state.status).not.toBe('loading'));
  return hook;
}

beforeEach(() => {
  mockGet.mockReset().mockResolvedValue({ ok: true, data: sam });
  mockUpdate.mockReset();
});

describe('usePersonalDetails', () => {
  it('loads the personal details', async () => {
    const { result } = await setup();
    expect(result.current.state).toEqual({ status: 'ready', data: sam });
  });

  it('shows an error when the details cannot be loaded, and reloads on retry', async () => {
    mockGet.mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const { result } = await setup();
    expect(result.current.state.status).toBe('error');

    await act(async () => result.current.reload());
    await waitFor(() => expect(result.current.state.status).toBe('ready'));
  });

  it('saves the details and reads them again', async () => {
    mockUpdate.mockResolvedValue({ ok: true, data: undefined });
    const { result } = await setup();
    mockGet.mockResolvedValue({ ok: true, data: { ...sam, name: 'Sam Lee' } });

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ name: 'Sam Lee', yearOfBirth: 1980 });
    });

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Sam Lee', yearOfBirth: 1980 });
    expect(saved).toEqual({ ok: true, data: undefined });
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: 'ready', data: { ...sam, name: 'Sam Lee' } }),
    );
    expect(result.current.saving).toBe(false);
  });

  it('returns a failed save without reading the details again', async () => {
    const error = { code: 'NETWORK', message: 'x' };
    mockUpdate.mockResolvedValue({ ok: false, error });
    const { result } = await setup();

    let saved: unknown;
    await act(async () => {
      saved = await result.current.save({ name: 'Sam', yearOfBirth: null });
    });

    expect(saved).toEqual({ ok: false, error });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual({ status: 'ready', data: sam });
  });
});
