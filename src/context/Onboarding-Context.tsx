import { createContext, useContext, useState, type ReactNode } from 'react';

type Sex = 'female' | 'male' | 'prefer not to say' | null;

interface OnboardingData {
    name: string;
    sex: Sex;
    yearOfBirth: number | null;
    hasDiagnosis: boolean | null;
    conditions: string[];
    otherConditions: string;
}

interface OnboardingContextValue {
    data: OnboardingData;
    updateData: (patch: Partial<OnboardingData>) => void;
    reset: () => void;
}

const initData: OnboardingData = {
    name: '',
    sex: null,
    yearOfBirth: null,
    hasDiagnosis: null,
    conditions: [],
    otherConditions: '',
}

const OnboardingContext = createContext<OnboardingContextValue | undefined> (undefined);

export function OnboardingProvider({ children }: { children: ReactNode }){
    const [data, setData] = useState<OnboardingData>(initData);
    const updateData = (patch: Partial<OnboardingData>) => setData((prev) => ({... prev, ...patch}));
    const reset = () => () => setData(initData);

    return (
        <OnboardingContext.Provider value = {{ data, updateData, reset }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const ctx = useContext(OnboardingContext);

    // Throws error when a screen is outside OnboardingProvider
    if(!ctx) throw new Error ('useOnboarding must be used within OnboardingProvider');
    return ctx;
}