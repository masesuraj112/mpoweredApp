import { act } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import RootLayout from '../app/_layout';

// The root layout reads the auth state from the context; this fake lets a test change it mid-test.
type MockAuth = {
  session: object | null;
  loading: boolean;
  hasProfile: boolean | null;
  profile: { userType: string } | null;
  profileError: null;
  refreshProfile: () => void;
};
const mockSignedOut: MockAuth = {
  session: null,
  loading: false,
  hasProfile: false,
  profile: null,
  profileError: null,
  refreshProfile: () => {},
};
let mockAuth: MockAuth = mockSignedOut;
const mockListeners = new Set<() => void>();

jest.mock('../src/context/AuthContext', () => {
  const { useEffect, useState } = jest.requireActual('react');
  return {
    AuthProvider: ({ children }: { children: unknown }) => children,
    useAuth: () => {
      const [, setTick] = useState(0);
      useEffect(() => {
        const listener = () => setTick((n: number) => n + 1);
        mockListeners.add(listener);
        return () => void mockListeners.delete(listener);
      }, []);
      return mockAuth;
    },
  };
});

async function setAuth(next: MockAuth) {
  await act(() => {
    mockAuth = next;
    mockListeners.forEach((listener) => listener());
  });
}

const patient: MockAuth = {
  ...mockSignedOut,
  session: {},
  hasProfile: true,
  profile: { userType: 'patient' },
};
const supportPerson: MockAuth = { ...patient, profile: { userType: 'support_person' } };

const screens = {
  _layout: RootLayout,
  '(auth)/_layout': Slot,
  '(auth)/index': () => <Text>auth screen</Text>,
  '(tabs)/_layout': Slot,
  '(tabs)/home': () => <Text>patient home</Text>,
  '(support)/_layout': Slot,
  '(support)/care-planner/index': () => <Text>support care planner</Text>,
};

describe('root layout routing', () => {
  beforeEach(() => {
    mockAuth = mockSignedOut;
  });

  it('shows the auth screens when signed out', async () => {
    await renderRouter(screens, { initialUrl: '/' });
    expect(await screen.findByText('auth screen')).toBeTruthy();
  });

  it('sends a patient who signs in to the patient home', async () => {
    await renderRouter(screens, { initialUrl: '/' });
    await screen.findByText('auth screen');

    await setAuth(patient);

    expect(await screen.findByText('patient home')).toBeTruthy();
  });

  it('sends a support person who signs in to the support care planner', async () => {
    await renderRouter(screens, { initialUrl: '/' });
    await screen.findByText('auth screen');

    await setAuth(supportPerson);

    expect(await screen.findByText('support care planner')).toBeTruthy();
  });

  it('keeps a support person out of the patient tabs', async () => {
    mockAuth = supportPerson;
    await renderRouter(screens, { initialUrl: '/home' });

    expect(await screen.findByText('support care planner')).toBeTruthy();
    expect(screen.queryByText('patient home')).toBeNull();
  });

  it('keeps a patient out of the support app', async () => {
    mockAuth = patient;
    await renderRouter(screens, { initialUrl: '/care-planner' });

    expect(await screen.findByText('patient home')).toBeTruthy();
    expect(screen.queryByText('support care planner')).toBeNull();
  });

  it('returns to the auth screens when a support person signs out', async () => {
    mockAuth = supportPerson;
    await renderRouter(screens, { initialUrl: '/care-planner' });
    await screen.findByText('support care planner');

    await setAuth(mockSignedOut);

    expect(await screen.findByText('auth screen')).toBeTruthy();
  });
});
