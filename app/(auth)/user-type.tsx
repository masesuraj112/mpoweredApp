import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { UserTypeCard } from '@/components/auth/UserTypeCard';
import { AppText } from '@/components/ui/AppText';
import { useOnboarding } from '@/context/Onboarding-Context';

type UserType = 'patient' | 'support-person';

const OPTIONS: {
  id: UserType;
  title: string;
  description: string;
  benefits: string[];
}[] = [
  {
    id: 'patient',
    title: 'I am a Patient',
    description: 'I am managing my own health journey',
    benefits: [
      'Track your symptoms and progress',
      'Connect with your support people',
      'Access personalised health insights',
    ],
  },
  {
    id: 'support-person',
    title: 'I am a Support Person',
    description: 'I am helping someone else with their health',
    benefits: [
      "Monitor a loved one's wellbeing",
      'Coordinate care and appointments',
      'View and edit questions for appointments',
    ],
  },
];

export default function UserTypeScreen() {
  const { data, updateData } = useOnboarding();

  const handleContinue = () => router.push('/(auth)/name');

  return (
    <AuthScreen>
      <AuthTitle>Which describes you best?</AuthTitle>
      <AppText variant="bodyLarge" color="onSurfaceVariant" style={styles.centered}>
        Tell us a little about yourself so we can personalise your experience.
      </AppText>

      {OPTIONS.map((option) => (
        <UserTypeCard
          key={option.id}
          title={option.title}
          description={option.description}
          benefits={option.benefits}
          selected={data.userType === option.id}
          onPress={() => updateData({ userType: option.id })}
        />
      ))}

      <AuthButton label="Continue" disabled={data.userType === null} onPress={handleContinue} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
