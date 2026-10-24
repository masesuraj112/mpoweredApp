import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import * as service from '@/services/support-person';

import { SupportPersonProvider, useSupportPerson } from './context';
import { SAMPLE_SUPPORTED_PATIENTS, SAMPLE_SUPPORT_REQUESTS } from './mock-data';

const wrapper = ({ children }: { children: ReactNode }) => <SupportPersonProvider>{children}</SupportPersonProvider>;

/** Renders the store and waits until it has finished loading. */
async function setup() {
  const hook = await renderHook(() => useSupportPerson(), { wrapper });
  await waitFor(() => expect(hook.result.current.status).not.toBe('loading'));
  return hook;
}

beforeEach(() => service.resetMockSupportPerson());
afterEach(() => jest.restoreAllMocks());

describe('useSupportPerson', () => {
  it('loads the patients and requests from the service', async () => {
    const { result } = await setup();
    expect(result.current.status).toBe('ready');
    expect(result.current.error).toBeNull();
    expect(result.current.patients).toHaveLength(SAMPLE_SUPPORTED_PATIENTS.length);
    expect(result.current.requests).toHaveLength(SAMPLE_SUPPORT_REQUESTS.length);
  });

  it('shows an error, with nothing loaded, when the service fails', async () => {
    jest
      .spyOn(service, 'listSupportedPatients')
      .mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'offline' } });
    const { result } = await setup();
    expect(result.current.status).toBe('error');
    expect(result.current.error?.code).toBe('NETWORK');
    expect(result.current.patients).toEqual([]);
  });

  it('loads again on reload', async () => {
    const failing = jest
      .spyOn(service, 'listSupportedPatients')
      .mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'offline' } });
    const { result } = await setup();
    expect(result.current.status).toBe('error');

    failing.mockRestore();
    await act(() => result.current.reload());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.patients).toHaveLength(SAMPLE_SUPPORTED_PATIENTS.length);
  });

  it('accepting a request adds the patient and removes the request', async () => {
    const { result } = await setup();
    const request = SAMPLE_SUPPORT_REQUESTS[0];

    await act(() => result.current.acceptRequest(request.id));

    expect(result.current.requests.map(r => r.id)).not.toContain(request.id);
    expect(result.current.patients.map(p => p.id)).toContain(request.patient.id);
    expect(result.current.getPatient(request.patient.id)?.name).toBe(request.patient.name);
  });

  it('rejecting a request removes it without adding the patient', async () => {
    const { result } = await setup();
    const request = SAMPLE_SUPPORT_REQUESTS[0];

    await act(() => result.current.rejectRequest(request.id));

    expect(result.current.requests.map(r => r.id)).not.toContain(request.id);
    expect(result.current.patients.map(p => p.id)).not.toContain(request.patient.id);
  });

  it('accepting an unknown request changes nothing', async () => {
    const { result } = await setup();

    await act(() => result.current.acceptRequest('does-not-exist'));

    expect(result.current.patients).toHaveLength(SAMPLE_SUPPORTED_PATIENTS.length);
    expect(result.current.requests).toHaveLength(SAMPLE_SUPPORT_REQUESTS.length);
  });

  it('unpairing removes the patient', async () => {
    const { result } = await setup();
    const patient = SAMPLE_SUPPORTED_PATIENTS[0];

    await act(() => result.current.unpair(patient.id));

    expect(result.current.patients.map(p => p.id)).not.toContain(patient.id);
    expect(result.current.getPatient(patient.id)).toBeUndefined();
  });

  it('throws when used outside the provider', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useSupportPerson())).rejects.toThrow(/SupportPersonProvider/);
    consoleError.mockRestore();
  });
});
