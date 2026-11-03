import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { OnboardingProvider, useOnboarding } from '@/context/Onboarding-Context';

const wrapper = ({ children }: { children: ReactNode }) => (
  <OnboardingProvider>{children}</OnboardingProvider>
);

describe('OnboardingContext.reset', () => {
  it('clears the answers back to their initial values', async () => {
    const { result } = await renderHook(() => useOnboarding(), { wrapper });

    await act(async () => {
      result.current.updateData({ name: 'Sam', userType: 'patient', conditions: ['Arthritis'] });
    });
    expect(result.current.data.name).toBe('Sam');

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.data.name).toBe('');
    expect(result.current.data.userType).toBeNull();
    expect(result.current.data.conditions).toEqual([]);
  });
});

describe('OnboardingContext intent', () => {
  it('starts empty, records the button tapped, and is cleared by reset', async () => {
    const { result } = await renderHook(() => useOnboarding(), { wrapper });
    expect(result.current.data.intent).toBeNull();

    await act(async () => {
      result.current.updateData({ intent: 'sign-in' });
    });
    expect(result.current.data.intent).toBe('sign-in');

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.data.intent).toBeNull();
  });
});
