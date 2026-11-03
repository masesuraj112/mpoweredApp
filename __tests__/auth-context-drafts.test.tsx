import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AuthProvider } from '@/context/AuthContext';
import { ASSESSMENT_DRAFT_PREFIX } from '@/features/assessments/drafts';

// The fake auth client hands the test the listener AuthProvider registers, so the test can fire events.
let mockAuthListener: (event: string, session: null) => void = () => {};

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (listener: typeof mockAuthListener) => {
        mockAuthListener = listener;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  },
}));

const draftKey = `${ASSESSMENT_DRAFT_PREFIX}v1/pain`;

async function mountProvider() {
  await render(
    <AuthProvider>
      <Text>child</Text>
    </AuthProvider>,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(draftKey, '{"intensity":3}');
});

describe('AuthProvider and saved assessment drafts', () => {
  it('clears the drafts when the user signs out', async () => {
    await mountProvider();

    await act(async () => {
      mockAuthListener('SIGNED_OUT', null);
    });

    expect(await AsyncStorage.getItem(draftKey)).toBeNull();
  });

  it('keeps the drafts for other auth events', async () => {
    await mountProvider();

    await act(async () => {
      mockAuthListener('TOKEN_REFRESHED', null);
    });

    expect(await AsyncStorage.getItem(draftKey)).toBe('{"intensity":3}');
  });
});
