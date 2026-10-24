import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AppError } from '@/lib/errors';
import {
  acceptSupportRequest,
  listSupportedPatients,
  listSupportRequests,
  rejectSupportRequest,
  unpairFromPatient,
} from '@/services/support-person';

import type { SupportedPatient, SupportRequest } from './types';

export type SupportPersonLoadStatus = 'loading' | 'error' | 'ready';

type SupportPersonContextType = {
  /** Whether the patients and requests have loaded. They are empty until `ready`. */
  status: SupportPersonLoadStatus;
  /** Why loading failed, when `status` is `error`. */
  error: AppError | null;
  /** Loads the patients and requests again (for a retry). */
  reload: () => void;
  patients: SupportedPatient[];
  requests: SupportRequest[];
  getPatient: (id: string) => SupportedPatient | undefined;
  /** These resolve to the error when saving failed (nothing changes on screen), or null when saved. */
  acceptRequest: (requestId: string) => Promise<AppError | null>;
  rejectRequest: (requestId: string) => Promise<AppError | null>;
  unpair: (patientId: string) => Promise<AppError | null>;
};

const SupportPersonContext = createContext<SupportPersonContextType | undefined>(undefined);

/**
 * Holds the support person's patients and pending requests for every screen in the (support) app,
 * so accepting a request on one screen shows the patient on the others.
 */
export function SupportPersonProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SupportPersonLoadStatus>('loading');
  const [error, setError] = useState<AppError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [patients, setPatients] = useState<SupportedPatient[]>([]);
  const [requests, setRequests] = useState<SupportRequest[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listSupportedPatients(), listSupportRequests()]).then(([patientsResult, requestsResult]) => {
      if (cancelled) return;
      if (!patientsResult.ok || !requestsResult.ok) {
        setError(!patientsResult.ok ? patientsResult.error : !requestsResult.ok ? requestsResult.error : null);
        setStatus('error');
        return;
      }
      setPatients(patientsResult.data);
      setRequests(requestsResult.data);
      setError(null);
      setStatus('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus('loading');
    setAttempt(n => n + 1);
  }, []);

  const getPatient = (id: string) => patients.find(patient => patient.id === id);

  // Each change is saved first and only then shown, so a failed save leaves the screen as it was.
  const acceptRequest = async (requestId: string) => {
    const result = await acceptSupportRequest(requestId);
    if (!result.ok) return result.error;
    const patient = result.data;
    setRequests(current => current.filter(r => r.id !== requestId));
    setPatients(current => (current.some(p => p.id === patient.id) ? current : [...current, patient]));
    return null;
  };

  const rejectRequest = async (requestId: string) => {
    const result = await rejectSupportRequest(requestId);
    if (!result.ok) return result.error;
    setRequests(current => current.filter(r => r.id !== requestId));
    return null;
  };

  const unpair = async (patientId: string) => {
    const result = await unpairFromPatient(patientId);
    if (!result.ok) return result.error;
    setPatients(current => current.filter(p => p.id !== patientId));
    return null;
  };

  return (
    <SupportPersonContext.Provider
      value={{ status, error, reload, patients, requests, getPatient, acceptRequest, rejectRequest, unpair }}
    >
      {children}
    </SupportPersonContext.Provider>
  );
}

export function useSupportPerson() {
  const context = useContext(SupportPersonContext);
  if (!context) throw new Error('useSupportPerson must be used within a SupportPersonProvider');
  return context;
}
