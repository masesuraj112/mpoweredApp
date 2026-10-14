import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { hasProfile as fetchHasProfile } from '../services/auth';
import type { AppError } from '../lib/errors';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Whether the signed-in user has a profile row. null while it is being checked. */
  hasProfile: boolean | null;
  /** Set when the profile check failed (for example no connection); cleared by refreshProfile. */
  profileError: AppError | null;
  /** Checks again whether the signed-in user has a profile. */
  refreshProfile: () => Promise<void>;
};

// Following React documentation, intialised the context with undefined and handle it in the useAuth hook to ensure that the context is used within a provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);
    const [profileError, setProfileError] = useState<AppError | null>(null);
    const userId = session?.user?.id ?? null;

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const refreshProfile = useCallback(async () => {
        setProfileError(null);
        const result = await fetchHasProfile(supabase);
        if (result.ok) {
            setHasProfile(result.data);
        } else if (result.error.code === 'NO_SESSION') {
            setHasProfile(false);
        } else {
            setProfileError(result.error);
        }
    }, []);

    // Check for a profile when the signed-in user changes (not on every token refresh).
    useEffect(() => {
        if (loading) return;
        if (userId === null) {
            setHasProfile(false);
            setProfileError(null);
            return;
        }
        setHasProfile(null);
        refreshProfile();
    }, [userId, loading, refreshProfile]);

    const value: AuthContextType = {
        user: session?.user ?? null,
        session,
        loading,
        hasProfile,
        profileError,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
