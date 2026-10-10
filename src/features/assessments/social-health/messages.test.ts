import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import type { AppError, AppErrorCode } from '@/lib/errors';

const error = (code: AppErrorCode, extra: Partial<AppError> = {}): AppError => ({
  code,
  message: 'raw message',
  ...extra,
});

describe('socialHealthSaveMessage', () => {
  it('has a distinct, friendly message for each failure the user can hit', () => {
    const codes: AppErrorCode[] = [
      'DUPLICATE_WEEK',
      'FUTURE_DATE',
      'BEFORE_START',
      'NO_PROFILE',
      'NOT_ALLOWED',
      'NETWORK',
      'UNKNOWN',
    ];
    const messages = codes.map((code) => socialHealthSaveMessage(error(code)));
    expect(new Set(messages).size).toBe(codes.length);
    for (const message of messages) expect(message).not.toContain('raw message');
  });

  it('tells the user they have already recorded this week', () => {
    expect(socialHealthSaveMessage(error('DUPLICATE_WEEK'))).toBe(
      'You have already recorded your social health for this week.',
    );
  });

  it('shows the app validation message when the answer is known', () => {
    expect(
      socialHealthSaveMessage(error('VALIDATION', { field: 'travel', message: 'Answer the travelling question.' })),
    ).toBe('Answer the travelling question.');
  });

  it('hides a raw database validation message', () => {
    const message = socialHealthSaveMessage(
      error('VALIDATION', { message: 'MISSING_ANSWER', detail: 'MISSING_ANSWER' }),
    );
    expect(message).not.toContain('MISSING_ANSWER');
  });

  it('treats a missing session like a permission failure', () => {
    expect(socialHealthSaveMessage(error('NO_SESSION'))).toBe(socialHealthSaveMessage(error('NOT_ALLOWED')));
  });
});
