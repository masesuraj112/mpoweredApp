import { router } from 'expo-router';
import { useEffect } from 'react';

import { WelcomeSplash } from '@/components/splash/WelcomeSplash';
import { WELCOME_SPLASH_MS } from '@/features/splash/startup';

/** The first screen when signed out: "Welcome to MPowered", then onboarding. */
export default function WelcomeScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, WELCOME_SPLASH_MS);

    return () => clearTimeout(timeout);
  }, []);

  return <WelcomeSplash greeting="Welcome to" />;
}
