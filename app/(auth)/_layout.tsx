import { OnboardingProvider } from '@/context/Onboarding-Context';
import { Stack } from 'expo-router';

// export default function AuthLayout() {
//   return <Stack screenOptions={{ headerShown: false }} />;
// }

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="name" />
        <Stack.Screen name="user-type" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="consent" />
        <Stack.Screen name="sex" />
        <Stack.Screen name="demographics" />
        <Stack.Screen name="diagnosis-conditions" />
        <Stack.Screen name="health-conditions" />
        <Stack.Screen name="other-conditions" />
        <Stack.Screen name="login-bridge" />
        <Stack.Screen name="phone" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="verification-confirmation" />
      </Stack>
    </OnboardingProvider>
  );
}