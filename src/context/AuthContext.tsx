import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile, type UserProfile } from '../services/auth';
import type { AppError } from '../lib/errors';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Whether the signed-in user has a profile row. null while it is being checked. */
  hasProfile: boolean | null;
  /** The signed-in user's own profile (type and name). null while checking or when there is none. */
  profile: UserProfile | null;
  /** Set when the profile check failed (for example no connection); cleared by refreshProfile. */
  profileError: AppError | null;
  /** Checks again whether the signed-in user has a profile. */
  refreshProfile: () => void;
};

// Following React documentation, intialised the context with undefined and handle it in the useAuth hook to ensure that the context is used within a provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    // The profile check is stored with the user it was made for, so it never applies to a
    // different user.
    const [profile, setProfile] = useState<{ userId: string; value: UserProfile | null } | null>(null);
    const [profileFailure, setProfileFailure] = useState<{ userId: string; error: AppError } | null>(null);
    const [profileCheck, setProfileCheck] = useState(0);
    const userId = session?.user?.id ?? null;
    const currentProfile = userId !== null && profile?.userId === userId ? profile : null;
    const hasProfile = userId === null ? false : currentProfile ? currentProfile.value !== null : null;
    const profileError = profileFailure?.userId === userId ? profileFailure.error : null;

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

    const refreshProfile = () => setProfileCheck((count) => count + 1);

    // Check for a profile when the signed-in user changes (not on every token refresh), and
    // again whenever refreshProfile is called.
    useEffect(() => {
        if (loading || userId === null) return;
        let cancelled = false;
        getProfile(supabase).then((result) => {
            if (cancelled) return;
            if (result.ok || result.error.code === 'NO_SESSION') {
                setProfile({ userId, value: result.ok ? result.data : null });
                setProfileFailure(null);
            } else {
                setProfileFailure({ userId, error: result.error });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [loading, userId, profileCheck]);

    const value: AuthContextType = {
        user: session?.user ?? null,
        session,
        loading,
        hasProfile,
        profile: currentProfile?.value ?? null,
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
