jest.mock('@/lib/supabase', () => {
  const listeners: ((event: string, session: unknown) => void)[] = [];
  return {
    supabase: {
      auth: {
        getSession: jest.fn(async () => ({ data: { session: null } })),
        onAuthStateChange: jest.fn((listener: (event: string, session: unknown) => void) => {
          listeners.push(listener);
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
      },
      __emit: (event: string, session: unknown) => listeners.forEach((listener) => listener(event, session)),
    },
  };
});
jest.mock('@/services/auth', () => ({ getProfile: jest.fn(async () => ({ ok: true, data: null })) }));
jest.mock('@/features/assessments/drafts', () => ({ clearAssessmentDrafts: jest.fn(async () => {}) }));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

import { AuthProvider, useAuth } from './AuthContext';

const emit = (supabase as unknown as { __emit: (event: string, session: unknown) => void }).__emit;
const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext sign-in hold', () => {
  it('starts released, can be held, and is released by signing out', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.signInHeld).toBe(false);

    await act(async () => result.current.holdSignIn(true));
    expect(result.current.signInHeld).toBe(true);

    await act(async () => emit('SIGNED_OUT', null));
    expect(result.current.signInHeld).toBe(false);
  });

  it('can be released directly', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await act(async () => result.current.holdSignIn(true));

    await act(async () => result.current.holdSignIn(false));

    expect(result.current.signInHeld).toBe(false);
  });
});
