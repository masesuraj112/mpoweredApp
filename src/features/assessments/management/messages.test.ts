import { managementSaveMessage } from '@/features/assessments/management/messages';
import type { AppError, AppErrorCode } from '@/lib/errors';

const error = (code: AppErrorCode, extra: Partial<AppError> = {}): AppError => ({
  code,
  message: 'raw message',
  ...extra,
});

describe('managementSaveMessage', () => {
  it('has a distinct, friendly message for each failure the user can hit', () => {
    const codes: AppErrorCode[] = [
      'DUPLICATE_WEEK',
      'VALIDATION',
      'FUTURE_DATE',
      'BEFORE_START',
      'NO_PROFILE',
      'NOT_ALLOWED',
      'NETWORK',
      'UNKNOWN',
    ];
    const messages = codes.map((code) => managementSaveMessage(error(code)));
    expect(new Set(messages).size).toBe(codes.length);
    for (const message of messages) expect(message).not.toContain('raw message');
  });

  it('tells the user they have already recorded this week', () => {
    expect(managementSaveMessage(error('DUPLICATE_WEEK'))).toBe(
      'You have already recorded your management for this week.',
    );
  });

  it('shows the app validation message when the answer is known', () => {
    expect(
      managementSaveMessage(error('VALIDATION', { field: 'exerciseDays', message: 'Answer the exercise question.' })),
    ).toBe('Answer the exercise question.');
  });

  it('hides a raw database validation message', () => {
    const message = managementSaveMessage(
      error('VALIDATION', { message: 'MEDICATION_CONFLICT', detail: 'MEDICATION_CONFLICT' }),
    );
    expect(message).not.toContain('MEDICATION_CONFLICT');
  });

  it('treats a missing session like a permission failure', () => {
    expect(managementSaveMessage(error('NO_SESSION'))).toBe(managementSaveMessage(error('NOT_ALLOWED')));
  });
});
