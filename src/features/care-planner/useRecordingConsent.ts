import { useCallback, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { saveRecordingConsent } from '@/services/care-planner';

import { isSignatureEmpty, serializeSignature, type SignatureData } from './signature';

export type RecordingConsentStatus = 'idle' | 'saving' | 'error';

/** Holds the drawn signature and saves it. `submit` resolves true when the save succeeded. */
export function useRecordingConsent(appointmentId: number) {
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [status, setStatus] = useState<RecordingConsentStatus>('idle');
  const [error, setError] = useState<AppError | null>(null);

  const canSubmit = !isSignatureEmpty(signature) && status !== 'saving';

  const changeSignature = useCallback((next: SignatureData | null) => {
    setSignature(next);
    setError(null);
    setStatus((current) => (current === 'error' ? 'idle' : current));
  }, []);

  const submit = useCallback(async (): Promise<boolean> => {
    if (!signature || isSignatureEmpty(signature)) return false;
    setStatus('saving');
    setError(null);
    const result = await saveRecordingConsent({
      appointmentId,
      signature: serializeSignature(signature),
      // timestamptz column: a UTC instant is correct here (unlike appointment date/times).
      consentedAt: new Date().toISOString(),
    });
    if (result.ok) {
      setStatus('idle');
      return true;
    }
    setError(result.error);
    setStatus('error');
    return false;
  }, [appointmentId, signature]);

  return { signature, changeSignature, canSubmit, status, error, submit };
}
