jest.mock('@/services/support-person', () => ({
  listSupportedPatients: jest.fn(),
  listSupportRequests: jest.fn(),
  acceptSupportRequest: jest.fn(),
  rejectSupportRequest: jest.fn(),
  unpairFromPatient: jest.fn(),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import * as service from '@/services/support-person';

import { SupportPersonProvider, useSupportPerson } from './context';
import type { SupportedPatient, SupportRequest } from './types';

const mocked = service as jest.Mocked<typeof service>;

const jane: SupportedPatient = {
  id: '7',
  name: 'Jane Cooper',
  condition: 'Chronic Back Pain',
  canAddQuestions: true,
  canAddAnswers: false,
  appointments: [],
};
const steven: SupportedPatient = { ...jane, id: '9', name: 'Steven Harper', canAddAnswers: true };
const maria: SupportedPatient = { ...jane, id: '11', name: 'Maria Lopez', condition: '' };
const request: SupportRequest = { id: '11', patient: maria };

const offline = { ok: false as const, error: { code: 'NETWORK' as const, message: 'offline' } };

const wrapper = ({ children }: { children: ReactNode }) => <SupportPersonProvider>{children}</SupportPersonProvider>;

/** Renders the store and waits until it has finished loading. */
async function setup() {
  const hook = await renderHook(() => useSupportPerson(), { wrapper });
  await waitFor(() => expect(hook.result.current.status).not.toBe('loading'));
  return hook;
}

beforeEach(() => {
  jest.resetAllMocks();
  mocked.listSupportedPatients.mockResolvedValue({ ok: true, data: [jane, steven] });
  mocked.listSupportRequests.mockResolvedValue({ ok: true, data: [request] });
  mocked.acceptSupportRequest.mockResolvedValue({ ok: true, data: maria });
  mocked.rejectSupportRequest.mockResolvedValue({ ok: true, data: undefined });
  mocked.unpairFromPatient.mockResolvedValue({ ok: true, data: undefined });
});

describe('useSupportPerson', () => {
  it('loads the patients and requests from the service', async () => {
    const { result } = await setup();
    expect(result.current.status).toBe('ready');
    expect(result.current.error).toBeNull();
    expect(result.current.patients).toHaveLength(2);
    expect(result.current.requests).toHaveLength(1);
  });

  it('shows an error, with nothing loaded, when the service fails', async () => {
    mocked.listSupportedPatients.mockResolvedValue(offline);
    const { result } = await setup();
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('NETWORK');
    expect(result.current.patients).toEqual([]);
  });

  it('loads again on reload', async () => {
    mocked.listSupportedPatients.mockResolvedValueOnce(offline);
    const { result } = await setup();
    expect(result.current.status).toBe('error');

    await act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.patients).toHaveLength(2);
    expect(mocked.listSupportedPatients).toHaveBeenCalledTimes(2);
  });

  it('accepting a request adds the patient and removes the request', async () => {
    const { result } = await setup();

    await act(() => result.current.acceptRequest(request.id));

    expect(mocked.acceptSupportRequest).toHaveBeenCalledWith(request.id);
    expect(result.current.requests.map(r => r.id)).not.toContain(request.id);
    expect(result.current.getPatient(maria.id)?.name).toBe(maria.name);
  });

  it('rejecting a request removes it without adding the patient', async () => {
    const { result } = await setup();

    await act(() => result.current.rejectRequest(request.id));

    expect(mocked.rejectSupportRequest).toHaveBeenCalledWith(request.id);
    expect(result.current.requests.map(r => r.id)).not.toContain(request.id);
    expect(result.current.patients.map(p => p.id)).not.toContain(maria.id);
  });

  it('unpairing removes the patient', async () => {
    const { result } = await setup();

    await act(() => result.current.unpair(jane.id));

    expect(mocked.unpairFromPatient).toHaveBeenCalledWith(jane.id);
    expect(result.current.getPatient(jane.id)).toBeUndefined();
  });

  it('keeps the request when accepting fails, and returns the error', async () => {
    mocked.acceptSupportRequest.mockResolvedValue(offline);
    const { result } = await setup();

    let error: unknown;
    await act(async () => {
      error = await result.current.acceptRequest(request.id);
    });

    expect(error).toEqual({ code: 'NETWORK', message: 'offline' });
    expect(result.current.requests.map(r => r.id)).toContain(request.id);
    expect(result.current.patients.map(p => p.id)).not.toContain(maria.id);
  });

  it('keeps the request when rejecting fails', async () => {
    mocked.rejectSupportRequest.mockResolvedValue(offline);
    const { result } = await setup();

    await act(() => result.current.rejectRequest(request.id));

    expect(result.current.requests.map(r => r.id)).toContain(request.id);
  });

  it('keeps the patient when unpairing fails', async () => {
    mocked.unpairFromPatient.mockResolvedValue(offline);
    const { result } = await setup();

    await act(() => result.current.unpair(jane.id));

    expect(result.current.getPatient(jane.id)).toBeDefined();
  });

  it('throws when used outside the provider', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useSupportPerson())).rejects.toThrow(/SupportPersonProvider/);
    consoleError.mockRestore();
  });
});
