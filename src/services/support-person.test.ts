import {
  acceptSupportRequest,
  listSupportedPatients,
  listSupportRequests,
  rejectSupportRequest,
  resetMockSupportPerson,
  unpairFromPatient,
} from './support-person';

beforeEach(() => resetMockSupportPerson());

const ids = <T extends { id: string }>(items: T[]) => items.map(item => item.id);

async function patientIds() {
  const result = await listSupportedPatients();
  if (!result.ok) throw new Error('listSupportedPatients failed');
  return ids(result.data);
}

async function requestIds() {
  const result = await listSupportRequests();
  if (!result.ok) throw new Error('listSupportRequests failed');
  return ids(result.data);
}

describe('listSupportedPatients and listSupportRequests', () => {
  it('start with the sample data', async () => {
    expect(await patientIds()).toEqual(['jane-cooper', 'steven-harper']);
    expect(await requestIds()).toEqual(['request-1', 'request-2']);
  });

  it('return copies, so changing a result does not change the store', async () => {
    const result = await listSupportedPatients();
    if (result.ok) result.data.pop();
    expect(await patientIds()).toHaveLength(2);
  });
});

describe('acceptSupportRequest', () => {
  it('removes the request and adds the patient', async () => {
    const result = await acceptSupportRequest('request-1');
    expect(result.ok && result.data.id).toBe('maria-lopez');
    expect(await requestIds()).toEqual(['request-2']);
    expect(await patientIds()).toContain('maria-lopez');
  });

  it('fails for an unknown request and changes nothing', async () => {
    const result = await acceptSupportRequest('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('REQUEST_NOT_FOUND');
    expect(await requestIds()).toHaveLength(2);
  });
});

describe('rejectSupportRequest', () => {
  it('removes the request without adding the patient', async () => {
    expect((await rejectSupportRequest('request-1')).ok).toBe(true);
    expect(await requestIds()).toEqual(['request-2']);
    expect(await patientIds()).not.toContain('maria-lopez');
  });

  it('fails for an unknown request', async () => {
    expect((await rejectSupportRequest('nope')).ok).toBe(false);
  });
});

describe('unpairFromPatient', () => {
  it('removes the patient', async () => {
    expect((await unpairFromPatient('jane-cooper')).ok).toBe(true);
    expect(await patientIds()).toEqual(['steven-harper']);
  });

  it('fails for a patient who is not supported', async () => {
    const result = await unpairFromPatient('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('PATIENT_NOT_FOUND');
  });
});
