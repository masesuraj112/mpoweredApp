import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MyAppointmentsSection } from '@/components/care-planner/MyAppointmentsSection';
import { PlannerIntro } from '@/components/care-planner/PlannerIntro';
import { ShortcutCarousel, type Shortcut } from '@/components/care-planner/ShortcutCarousel';
import { SponsorFooter } from '@/components/care-planner/SponsorFooter';
import { Spacing, makeStyles } from '@/constants/theme';
import { useAppointments } from '@/features/care-planner/useAppointments';

export default function PlannerScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { reload, refresh, ...appointments } = useAppointments();

  // A new appointment is planned on another screen. Read the list again when coming back.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  const shortcuts: Shortcut[] = [
    {
      id: 'questions',
      title: 'Explore questions generated for me',
      actionLabel: 'Explore questions',
      onPress: () => router.push('/planner/explore-questions'),
    },
    {
      id: 'pain-guide',
      title: 'Explore self-management tips for my ongoing pain',
      actionLabel: 'Explore tips',
      onPress: () => router.push('/planner/pain-guide'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PlannerIntro />
        <ShortcutCarousel shortcuts={shortcuts} />
        <MyAppointmentsSection
          state={appointments}
          onRetry={reload}
          onPrepare={() => router.push('/planner/appointment-details')}
          onAdd={() => router.push('/planner/appointment-details')}
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

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
}));
