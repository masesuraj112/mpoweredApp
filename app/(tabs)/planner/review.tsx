import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentOverviewCard } from '@/components/care-planner/AppointmentOverviewCard';
import { PlanActionBar } from '@/components/care-planner/PlanActionBar';
import { QuestionGroupList } from '@/components/care-planner/QuestionGroupList';
import { RecordingConsentRow } from '@/components/care-planner/RecordingConsentRow';
import { BackButton } from '@/components/ui/BackButton';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import {
  displayOrPlaceholder,
  formatShortAppointmentDate,
  isPlanEmpty,
} from '@/features/care-planner/planDisplay';
import { useAppointmentPlan } from '@/features/care-planner/useAppointmentPlan';

export default function ReviewScreen() {
  const router = useRouter();
  const { appointmentId: appointmentIdParam } = useLocalSearchParams<{ appointmentId?: string }>();
  const appointmentId = Number(appointmentIdParam);
  const state = useAppointmentPlan(appointmentId);
  const [consented, setConsented] = useState(false);

  const editAnswer = (questionId: number) =>
    router.push({
      pathname: '/planner/answer',
      params: { appointmentId: String(appointmentId), questionId: String(questionId) },
    });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Review My Appointment Plan
        </Text>

        {state.status === 'loading' ? <LoadingState label="Loading appointment plan" /> : null}

        {state.status === 'error' ? (
          <ErrorState message="We could not load your appointment plan." onRetry={state.reload} />
        ) : null}

        {state.status === 'ready' ? (
          <Card style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Appointment overview
            </Text>
            <AppointmentOverviewCard
              dateText={displayOrPlaceholder(formatShortAppointmentDate(state.plan.appointment.dateTime))}
              doctorName={displayOrPlaceholder(state.plan.appointment.practitionerName)}
              healthService={displayOrPlaceholder(state.plan.appointment.healthService)}
              supportPerson={displayOrPlaceholder(state.plan.supportPersonName)}
            />

            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Questions to ask
            </Text>
            <RecordingConsentRow checked={consented} onChange={setConsented} />

            {isPlanEmpty(state.plan) ? (
              <EmptyState message="You have not added any questions for this appointment yet." />
            ) : (
              state.plan.questionGroups
                .filter((group) => group.questions.length > 0)
                .map((group) => (
                  <QuestionGroupList key={group.groupId} group={group} onEditAnswer={editAnswer} />
                ))
            )}
          </Card>
        ) : null}
      </ScrollView>

      <PlanActionBar
        consented={consented}
        onModifyQuestions={() =>
          router.push({
            pathname: '/planner/consent',
            params: { appointmentId: String(appointmentId) },
          })
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    color: Colors.light.text,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
