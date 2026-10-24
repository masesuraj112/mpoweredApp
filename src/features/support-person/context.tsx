import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { AppError } from '@/lib/errors';
import { listSupportedPatients, listSupportRequests } from '@/services/support-person';

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
  acceptRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;
  unpair: (patientId: string) => void;
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

  const acceptRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    setRequests(current => current.filter(r => r.id !== requestId));
    setPatients(current =>
      current.some(p => p.id === request.patient.id) ? current : [...current, request.patient],
    );
  };

  const rejectRequest = (requestId: string) => {
    setRequests(current => current.filter(r => r.id !== requestId));
  };

  const unpair = (patientId: string) => {
    setPatients(current => current.filter(p => p.id !== patientId));
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
