import { useCallback, useEffect, useState } from 'react';

import { authErrorMessage } from '@/features/auth/messages';
import { isCodeComplete, RESEND_SECONDS, sanitiseCode } from '@/features/auth/otp';
import { deleteAccount } from '@/services/account';
import { sendVerificationCode, signOut } from '@/services/auth';

/** Messages for the delete step; sign-in messages cover the code errors. */
function deleteMessage(code: string): string {
  if (code === 'INVALID_OTP' || code === 'OTP_EXPIRED' || code === 'RATE_LIMITED' || code === 'NETWORK') {
    return authErrorMessage(code);
  }
  return 'We could not delete your account. Please try again.';
}

/**
 * Settings > Privacy/Data and Legal > Account deletion, confirmed with a new SMS code instead of a
 * password (docs/settings-backend.md, step 9):
 *   start()   texts a code to `phone` (the account's own number, from the profile) and opens the code step
 *   setCode() keeps digits only
 *   resend()  texts a new code once `resendIn` reaches 0
 *   confirm() deletes the account with the code, then signs out
 * Each action resolves with an error message to show, or null.
 */
export function useAccountDeletion(phone: string | null) {
  const [stage, setStage] = useState<'idle' | 'code'>('idle');
  const [code, setCodeState] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Ticks once a second while the resend wait is running.
  useEffect(() => {
    if (stage !== 'code' || sentAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [stage, sentAt]);

  const resendIn =
    sentAt === null ? 0 : Math.max(0, RESEND_SECONDS - Math.floor((now - sentAt) / 1000));

  const send = useCallback(async (): Promise<string | null> => {
    if (!phone) return 'Account deletion needs a phone number on your account.';
    setBusy(true);
    const result = await sendVerificationCode(phone);
    setBusy(false);
    if (!result.ok) return authErrorMessage(result.error.code);
    const sent = Date.now();
    setSentAt(sent);
    setNow(sent);
    return null;
  }, [phone]);

  const start = useCallback(async (): Promise<string | null> => {
    const message = await send();
    if (message) return message;
    setCodeState('');
    setError('');
    setStage('code');
    return null;
  }, [send]);

  const resend = useCallback(async (): Promise<string | null> => {
    if (resendIn > 0) return null;
    const message = await send();
    setError(message ?? '');
    return message;
  }, [resendIn, send]);

  const setCode = useCallback((value: string) => {
    setCodeState(sanitiseCode(value));
    setError('');
  }, []);

  const confirm = useCallback(async (): Promise<string | null> => {
    if (!isCodeComplete(code)) {
      const message = authErrorMessage('INVALID_OTP');
      setError(message);
      return message;
    }
    setBusy(true);
    const result = await deleteAccount(code);
    if (!result.ok) {
      setBusy(false);
      const message = deleteMessage(result.error.code);
      setError(message);
      return message;
    }
    // The account is gone; the root guard returns to the start of the app once signed out.
    await signOut();
    setBusy(false);
    setStage('idle');
    return null;
  }, [code]);

  const cancel = useCallback(() => {
    setStage('idle');
    setCodeState('');
    setError('');
  }, []);

  return { stage, code, setCode, error, busy, resendIn, start, resend, confirm, cancel };
}
