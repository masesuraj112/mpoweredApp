import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { formatForDisplay, toE164 } from '@/features/auth/phone';
import { signOut } from '@/services/auth';

export type AccountCheckReason = 'account-exists' | 'no-account';

/**
 * Shown after a correct code when the number doesn't match what the person started: signing up with a
 * number that already has an account, or signing in with one that has none
 * (docs/backend/sign-up-sign-in-plan.md, SU-2 to SU-4). The person is signed in here.
 */
export default function AccountCheckScreen() {
  const styles = useStyles();
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const accountExists = reason === 'account-exists';
  const { data, updateData } = useOnboarding();
  const { holdSignIn } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phone = toE164(data.phoneNumber);
  const number = phone.ok ? formatForDisplay(phone.data) : 'this number';

  // Releasing the hold lets the root guard take them to their account.
  const signInToAccount = () => holdSignIn(false);

  const createAccount = () => {
    updateData({ intent: 'sign-up' });
    router.replace('/(auth)/user-type');
  };

  // Signs out first, so a different number starts afresh. The sign-up answers stay for the next try.
  const useDifferentNumber = async () => {
    setError(null);
    setSigningOut(true);
    const result = await signOut();
    setSigningOut(false);
    if (!result.ok) {
      setError('We could not sign you out. Please check your connection and try again.');
      return;
    }
    router.replace('/(auth)/phone');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {accountExists ? 'You already have an account' : 'No account found'}
        </Text>
        <Text style={styles.body}>
          {accountExists
            ? `There’s already an MPowered account for ${number}. The answers you just gave won’t be saved.`
            : `We couldn’t find an MPowered account for ${number}.`}
        </Text>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <View style={styles.actions}>
          <Button
            label={accountExists ? 'Sign in to my account' : 'Create an account'}
            variant="primary"
            disabled={signingOut}
            onPress={accountExists ? signInToAccount : createAccount}
          />
          <Button
            label={signingOut ? 'Signing out…' : 'Use a different number'}
            variant="outlined"
            disabled={signingOut}
            onPress={useDifferentNumber}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  title: {
    ...Typography.title,
    color: colors.onSurface,
  },
  body: {
    ...Typography.bodyLarge,
    color: colors.onSurfaceVariant,
  },
  error: {
    ...Typography.bodyMedium,
    color: colors.error,
  },
  actions: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
}));
