import { createContext, useContext, useState, type ReactNode } from 'react';

import { SAMPLE_SUPPORTED_PATIENTS, SAMPLE_SUPPORT_REQUESTS } from './mock-data';
import type { SupportedPatient, SupportRequest } from './types';

type SupportPersonContextType = {
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
  const [patients, setPatients] = useState<SupportedPatient[]>(SAMPLE_SUPPORTED_PATIENTS);
  const [requests, setRequests] = useState<SupportRequest[]>(SAMPLE_SUPPORT_REQUESTS);

  const getPatient = (id: string) => patients.find(patient => patient.id === id);

  const acceptRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    // TODO: save to Supabase (mark the support_persons row as accepted).
    setRequests(current => current.filter(r => r.id !== requestId));
    setPatients(current =>
      current.some(p => p.id === request.patient.id) ? current : [...current, request.patient],
    );
  };

  const rejectRequest = (requestId: string) => {
    // TODO: save to Supabase (delete the pending support_persons row).
    setRequests(current => current.filter(r => r.id !== requestId));
  };

  const unpair = (patientId: string) => {
    // TODO: save to Supabase (delete this support person's support_persons row for the patient).
    setPatients(current => current.filter(p => p.id !== patientId));
  };

  return (
    <SupportPersonContext.Provider value={{ patients, requests, getPatient, acceptRequest, rejectRequest, unpair }}>
      {children}
    </SupportPersonContext.Provider>
  );
}

export function useSupportPerson() {
  const context = useContext(SupportPersonContext);
  if (!context) throw new Error('useSupportPerson must be used within a SupportPersonProvider');
  return context;
}
