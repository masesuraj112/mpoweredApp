import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyAppointmentsSection } from '@/components/care-planner/MyAppointmentsSection';
import { PlannerIntro } from '@/components/care-planner/PlannerIntro';
import { ShortcutCarousel, type Shortcut } from '@/components/care-planner/ShortcutCarousel';
import { SponsorFooter } from '@/components/care-planner/SponsorFooter';
import { BottomTabInset, Colors, Spacing } from '@/constants/theme';
import { useAppointments } from '@/features/care-planner/useAppointments';

export default function PlannerScreen() {
  const router = useRouter();
  const { reload, ...appointments } = useAppointments();

  const shortcuts: Shortcut[] = [
    {
      id: 'questions',
      title: 'Explore questions generated for me',
      actionLabel: 'Explore questions',
      onPress: () => router.push('/planner/questions'),
    },
    {
      id: 'pain-guide',
      title: 'Explore self-management tips for my ongoing pain',
      actionLabel: 'Explore tips',
      onPress: () => router.push('/health/pain-guide'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PlannerIntro />
        <ShortcutCarousel shortcuts={shortcuts} />
        <MyAppointmentsSection
          state={appointments}
          onRetry={reload}
          onPrepare={() => router.push('/planner/appointment-details')}
          onViewAppointment={(appointmentId) =>
            router.push({
              pathname: '/planner/review',
              params: { appointmentId: String(appointmentId) },
            })
          }
        />
        <SponsorFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
});
