import {
  clearMockCreatedAppointments,
  createAppointment,
  getAppointmentPlan,
  getSupportPeople,
  listAppointments,
  markAppointmentSaved,
  saveSupportPeople,
  updateAppointmentDetails,
} from './care-planner';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

const input = {
  dateTime: '2026-10-23T09:00:00',
  practitionerName: 'Dr Who',
  healthService: 'Physiotherapist',
};

beforeEach(() => {
  clearMockCreatedAppointments();
});

async function listedIds(): Promise<number[]> {
  const result = await listAppointments();
  return result.ok ? result.data.map((a) => a.appointmentId) : [];
}

describe('appointment drafts', () => {
  it('creates a draft that is not listed', async () => {
    const created = await createAppointment(input);
    expect(created.ok && created.data.status).toBe('draft');
    if (!created.ok) return;
    expect(await listedIds()).not.toContain(created.data.appointmentId);
  });

  it('lists the appointment once it has been marked saved', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');

    const marked = await markAppointmentSaved(created.data.appointmentId);
    expect(marked.ok).toBe(true);
    expect(await listedIds()).toContain(created.data.appointmentId);
  });

  it('keeps the sample appointments listed', async () => {
    expect(await listedIds()).toEqual(expect.arrayContaining([1, 2]));
  });

  it('updates a draft without creating a second record', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');
    const id = created.data.appointmentId;

    const updated = await updateAppointmentDetails(id, {
      ...input,
      dateTime: '2026-10-24T10:30:00',
    });
    expect(updated.ok && updated.data.dateTime).toBe('2026-10-24T10:30:00');

    await markAppointmentSaved(id);
    const listed = await listAppointments();
    const matching = listed.ok ? listed.data.filter((a) => a.appointmentId === id) : [];
    expect(matching).toHaveLength(1);
    expect(matching[0].dateTime).toBe('2026-10-24T10:30:00');
  });

  it('fails to update or save an unknown appointment', async () => {
    expect((await updateAppointmentDetails(999, input)).ok).toBe(false);
    expect((await markAppointmentSaved(999)).ok).toBe(false);
  });

  it('gives every created appointment its own id', async () => {
    const a = await createAppointment(input);
    const b = await createAppointment(input);
    expect(a.ok && b.ok && a.data.appointmentId !== b.data.appointmentId).toBe(true);
  });
});

describe('support people', () => {
  const bron = { name: 'Bron', phone: null, email: null, canAddQuestions: true, canAddAnswers: false };
  const sam = { name: 'Sam', phone: '0400000000', email: null, canAddQuestions: false, canAddAnswers: true };

  it('has none for a new appointment', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');
    const people = await getSupportPeople(created.data.appointmentId);
    expect(people.ok && people.data).toEqual([]);
  });

  it('replaces the list instead of adding to it', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');
    const id = created.data.appointmentId;

    await saveSupportPeople(id, [bron]);
    await saveSupportPeople(id, [bron, sam]);
    await saveSupportPeople(id, [bron, sam]);

    const people = await getSupportPeople(id);
    expect(people.ok && people.data.map((p) => p.name)).toEqual(['Bron', 'Sam']);
  });

  it('can be cleared (skipped)', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');
    const id = created.data.appointmentId;

    await saveSupportPeople(id, [bron]);
    await saveSupportPeople(id, []);

    const people = await getSupportPeople(id);
    expect(people.ok && people.data).toEqual([]);
  });

  it('shows the names on the plan', async () => {
    const created = await createAppointment(input);
    if (!created.ok) throw new Error('create failed');
    const id = created.data.appointmentId;

    await saveSupportPeople(id, [bron, sam]);
    const plan = await getAppointmentPlan(id);
    expect(plan.ok && plan.data.supportPersonName).toBe('Bron, Sam');
    expect(plan.ok && plan.data.appointment.status).toBe('draft');
  });

  it('fails for an unknown appointment', async () => {
    expect((await saveSupportPeople(999, [bron])).ok).toBe(false);
    expect((await getSupportPeople(999)).ok).toBe(false);
  });
});
