import { painSaveMessage } from '@/features/assessments/pain/messages';
import type { AppError, AppErrorCode } from '@/lib/errors';

const error = (code: AppErrorCode, extra: Partial<AppError> = {}): AppError => ({
  code,
  message: 'raw message',
  ...extra,
});

describe('painSaveMessage', () => {
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
    const messages = codes.map((code) => painSaveMessage(error(code)));
    expect(new Set(messages).size).toBe(codes.length);
    for (const message of messages) expect(message).not.toContain('raw message');
  });

  it('shows the app validation message when the answer is known', () => {
    expect(
      painSaveMessage(error('VALIDATION', { field: 'worstPain', message: 'Answer the worst pain question.' })),
    ).toBe('Answer the worst pain question.');
  });

  it('hides a raw database validation message', () => {
    expect(painSaveMessage(error('VALIDATION', { message: 'violates check constraint' }))).not.toContain(
      'constraint',
    );
  });

  it('treats a missing session like a permission failure', () => {
    expect(painSaveMessage(error('NO_SESSION'))).toBe(painSaveMessage(error('NOT_ALLOWED')));
  });
});
