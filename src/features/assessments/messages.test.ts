import { assessmentSaveMessage } from '@/features/assessments/messages';
import type { AppError, AppErrorCode } from '@/lib/errors';

const error = (code: AppErrorCode, extra: Partial<AppError> = {}): AppError => ({
  code,
  message: 'raw message',
  ...extra,
});

describe('assessmentSaveMessage', () => {
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
    const messages = codes.map((code) => assessmentSaveMessage(error(code), 'movement'));
    expect(new Set(messages).size).toBe(codes.length);
    for (const message of messages) expect(message).not.toContain('raw message');
  });

  it('names the assessment in the messages that mention it', () => {
    expect(assessmentSaveMessage(error('DUPLICATE_WEEK'), 'movement')).toBe(
      'You have already recorded your movement for this week.',
    );
    expect(assessmentSaveMessage(error('FUTURE_DATE'), 'movement')).toContain('movement');
    expect(assessmentSaveMessage(error('BEFORE_START'), 'movement')).toContain('movement');
  });

  it('shows the app validation message when the answer is known', () => {
    expect(
      assessmentSaveMessage(
        error('VALIDATION', { field: 'walkingImpact', message: 'Answer the walking question.' }),
        'movement',
      ),
    ).toBe('Answer the walking question.');
  });

  it('hides a raw database validation message', () => {
    expect(
      assessmentSaveMessage(error('VALIDATION', { message: 'violates check constraint' }), 'movement'),
    ).not.toContain('constraint');
  });

  it('treats a missing session like a permission failure', () => {
    expect(assessmentSaveMessage(error('NO_SESSION'), 'movement')).toBe(
      assessmentSaveMessage(error('NOT_ALLOWED'), 'movement'),
    );
  });
});