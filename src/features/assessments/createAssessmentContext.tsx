import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

export function createAssessmentContext<TAnswers extends object>(storageKey: string) {
  type ContextType = {
    answers: TAnswers;
    updateAnswer: <K extends keyof TAnswers>(key: K, value: TAnswers[K]) => void;
  };

  const Context = createContext<ContextType | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [answers, setAnswers] = useState<TAnswers>({} as TAnswers);
    const [isHydrated, setIsHydrated] = useState(false);
    const writeQueue = useRef(Promise.resolve());

    useEffect(() => {
      let isCurrent = true;

      AsyncStorage.getItem(storageKey)
        .then(serialized => {
          if (!serialized) return;
          const stored: unknown = JSON.parse(serialized);
          if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
            throw new Error('Stored assessment draft has an invalid format.');
          }
          if (isCurrent) {
            setAnswers(current => Object.assign({}, stored, current) as TAnswers);
          }
        })
        .catch((error: unknown) => {
          if (isCurrent) {
            console.error(`[Assessment] Failed to load local draft (${storageKey}):`, error);
          }
        })
        .finally(() => {
          if (isCurrent) setIsHydrated(true);
        });

      return () => {
        isCurrent = false;
      };
    }, []);

    useEffect(() => {
      if (!isHydrated) return;
      writeQueue.current = writeQueue.current
        .then(() => AsyncStorage.setItem(storageKey, JSON.stringify(answers)))
        .catch((error: unknown) => {
          console.error(`[Assessment] Failed to save local draft (${storageKey}):`, error);
        });
    }, [answers, isHydrated]);

    const updateAnswer: ContextType['updateAnswer'] = (key, value) =>
      setAnswers(prev => ({ ...prev, [key]: value }));

    return <Context.Provider value={{ answers, updateAnswer }}>{children}</Context.Provider>;
  }

  function useAssessment() {
    const ctx = useContext(Context);
    if (!ctx) throw new Error('useAssessment must be used within its matching Provider');
    return ctx;
  }

  return { Provider, useAssessment };
}