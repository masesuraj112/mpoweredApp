import { createContext, useContext, useState, ReactNode } from 'react';

export function createAssessmentContext<TAnswers extends object>() {
  type ContextType = {
    answers: TAnswers;
    updateAnswer: <K extends keyof TAnswers>(key: K, value: TAnswers[K]) => void;
  };

  const Context = createContext<ContextType | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [answers, setAnswers] = useState<TAnswers>({} as TAnswers);
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