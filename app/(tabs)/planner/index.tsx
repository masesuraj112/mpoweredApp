import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';

import { MyAppointmentsSection } from '@/components/care-planner/MyAppointmentsSection';
import { PlannerIntro } from '@/components/care-planner/PlannerIntro';
import { ShortcutCarousel, type Shortcut } from '@/components/care-planner/ShortcutCarousel';
import { SponsorFooter } from '@/components/care-planner/SponsorFooter';
import { BrandScreen } from '@/components/mpowered/BrandScreen';
import { makeStyles, Spacing } from '@/constants/theme';
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
    // The sections below set their own gutters, so the body is not padded again.
    <BrandScreen hero={<PlannerIntro />} padBody={false}>
      <View style={styles.sections}>
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
      </View>
    </BrandScreen>
  );
}

const useStyles = makeStyles(() => ({
  sections: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
}));
