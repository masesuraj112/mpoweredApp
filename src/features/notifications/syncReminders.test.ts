jest.mock('@/lib/supabase', () => ({ supabase: {} }));

import type { Appointment } from '@/features/care-planner/types';
import type { AssessmentSet } from '@/services/health';
import type { NotificationSettings } from '@/services/settings';

import type { Reminder } from './schedule';
import { lastAssessmentDate, syncReminders, type ReminderSources } from './syncReminders';

const NOW = new Date(2026, 10, 2, 12, 0);
const offline = { ok: false as const, error: { code: 'NETWORK' as const, message: 'offline' } };

const settings = (overrides: Partial<NotificationSettings> = {}): NotificationSettings => ({
  assessmentReminders: true,
  assessmentEvery: 3,
  assessmentUnit: 'days',
  appointmentReminders: true,
  appointmentDayBefore: true,
  appointmentOnDay: false,
  ...overrides,
});

const appointment: Appointment = {
  appointmentId: 42,
  dateTime: '2026-11-05T10:30:00',
  practitionerName: null,
  healthService: null,
  status: 'saved',
};

const noAssessments: AssessmentSet = { pain: null, movement: null, personalCare: null, socialHealth: null, management: null };

function fakeSources(overrides: Partial<ReminderSources> = {}): jest.Mocked<ReminderSources> {
  return {
    getReminderPermission: jest.fn(async () => ({ ok: true as const, data: { status: 'granted' as const, canAskAgain: true } })),
    getNotificationSettings: jest.fn(async () => ({ ok: true as const, data: settings() })),
    listAppointments: jest.fn(async () => ({ ok: true as const, data: [appointment] })),
    getLatestAssessments: jest.fn(async () => ({
      ok: true as const,
      data: { ...noAssessments, movement: { date: '2026-11-01' } } as unknown as AssessmentSet,
    })),
    applyReminders: jest.fn(async () => ({ ok: true as const, data: undefined })),
    cancelAllReminders: jest.fn(async () => ({ ok: true as const, data: undefined })),
    ...overrides,
  } as jest.Mocked<ReminderSources>;
}

const scheduled = (sources: jest.Mocked<ReminderSources>): Reminder[] => sources.applyReminders.mock.calls[0][0];

describe('syncReminders', () => {
  it('plans from the settings, appointments and last assessment, and schedules the result', async () => {
    const sources = fakeSources();

    expect(await syncReminders(NOW, sources)).toBe('scheduled');

    const ids = scheduled(sources).map((r) => r.id);
    expect(ids).toContain('appointment:42:day-before');
    // Last assessment 1 Nov, every 3 days: first due 4 Nov at 9:00.
    const first = scheduled(sources).find((r) => r.id === 'assessment:0')!;
    expect([first.at.getDate(), first.at.getHours()]).toEqual([4, 9]);
  });

  it('leaves everything alone without permission', async () => {
    const sources = fakeSources({
      getReminderPermission: jest.fn(async () => ({ ok: true as const, data: { status: 'denied' as const, canAskAgain: false } })),
    });

    expect(await syncReminders(NOW, sources)).toBe('no-permission');
    expect(sources.getNotificationSettings).not.toHaveBeenCalled();
    expect(sources.applyReminders).not.toHaveBeenCalled();
    expect(sources.cancelAllReminders).not.toHaveBeenCalled();
  });

  it('cancels when both kinds of reminder are off, without reading anything else', async () => {
    const sources = fakeSources({
      getNotificationSettings: jest.fn(async () => ({
        ok: true as const,
        data: settings({ appointmentReminders: false, assessmentReminders: false }),
      })),
    });

    expect(await syncReminders(NOW, sources)).toBe('cancelled');
    expect(sources.cancelAllReminders).toHaveBeenCalledTimes(1);
    expect(sources.listAppointments).not.toHaveBeenCalled();
    expect(sources.getLatestAssessments).not.toHaveBeenCalled();
  });

  it('only reads what the settings need', async () => {
    const sources = fakeSources({
      getNotificationSettings: jest.fn(async () => ({ ok: true as const, data: settings({ assessmentReminders: false }) })),
    });

    await syncReminders(NOW, sources);

    expect(sources.getLatestAssessments).not.toHaveBeenCalled();
    expect(scheduled(sources).every((r) => r.target.kind === 'appointment')).toBe(true);
  });

  it.each([
    ['permission', { getReminderPermission: jest.fn(async () => offline) }],
    ['settings', { getNotificationSettings: jest.fn(async () => offline) }],
    ['appointments', { listAppointments: jest.fn(async () => offline) }],
    ['assessments', { getLatestAssessments: jest.fn(async () => offline) }],
  ])('keeps the scheduled reminders when reading the %s fails', async (_, override) => {
    const sources = fakeSources(override as Partial<ReminderSources>);

    expect(await syncReminders(NOW, sources)).toBe('failed');
    expect(sources.applyReminders).not.toHaveBeenCalled();
    expect(sources.cancelAllReminders).not.toHaveBeenCalled();
  });

  it('reports a failure to schedule', async () => {
    const sources = fakeSources({ applyReminders: jest.fn(async () => offline) });

    expect(await syncReminders(NOW, sources)).toBe('failed');
  });
});

describe('lastAssessmentDate', () => {
  it('is the latest date of any kind', () => {
    const set = { ...noAssessments, pain: { date: '2026-10-20' }, management: { date: '2026-11-01' } } as unknown as AssessmentSet;

    expect(lastAssessmentDate(set)).toBe('2026-11-01');
  });

  it('is null with none', () => {
    expect(lastAssessmentDate(noAssessments)).toBeNull();
  });
});
