import { OnboardingProvider } from '@/context/Onboarding-Context';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

// A transparent header that shows only the platform's back arrow, so every step can be left without a
// swipe (docs/backend/sign-up-sign-in-plan.md, 4.6). It only appears when there is a screen to go back to.
const BACK_ARROW_ONLY = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: '',
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
  headerTintColor: Colors.light.primary,
} as const;

// No back arrow at the start of the flow, on the "verified" slides, or once the person is signed in and
// choosing what to do about their account (account-check has its own way back).
const NO_HEADER = { headerShown: false } as const;

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={BACK_ARROW_ONLY}>
        <Stack.Screen name="index" options={NO_HEADER} />
        <Stack.Screen name="onboarding" options={NO_HEADER} />
        <Stack.Screen name="user-type" />
        <Stack.Screen name="name" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="sex" />
        <Stack.Screen name="demographics" />
        <Stack.Screen name="health-conditions" />
        <Stack.Screen name="diagnosis-conditions" />
        <Stack.Screen name="other-conditions" />
        <Stack.Screen name="login-bridge" />
        <Stack.Screen name="phone" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="account-check" options={NO_HEADER} />
        <Stack.Screen name="verification-confirmation" options={NO_HEADER} />
      </Stack>
    </OnboardingProvider>
  );
}
