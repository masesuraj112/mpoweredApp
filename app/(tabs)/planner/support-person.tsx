import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuestionHintBanner } from '@/components/care-planner/QuestionHintBanner';
import { SupportPersonActionBar } from '@/components/care-planner/SupportPersonActionBar';
import { SupportPersonForm } from '@/components/care-planner/SupportPersonForm';
import { SupportPersonList } from '@/components/care-planner/SupportPersonList';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { useSupportPerson } from '@/features/care-planner/useSupportPerson';

// Wording copied exactly from the Figma design.
const INTRO =
  'You can nominate someone to help you prepare for your appointment or you can skip below.';

export default function SupportPersonScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { appointmentId: appointmentIdParam } = useLocalSearchParams<{ appointmentId?: string }>();
  const appointmentId = Number(appointmentIdParam);
  const form = useSupportPerson(appointmentId);
  const { dirty } = form;

  // Leaving with something entered or changed asks first (Back, hardware back and swipe back).
  const leaveAllowed = useRef(false);
  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (leaveAllowed.current || !dirty) return;
      event.preventDefault();
      Alert.alert('Discard this support person?', 'What you have entered has not been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            leaveAllowed.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });
  }, [navigation, dirty]);

  const goToQuestions = () =>
    router.push({
      pathname: '/planner/questions',
      params: { appointmentId: String(appointmentId) },
    });

  const save = async () => {
    if (await form.save()) goToQuestions();
  };

  const skip = async () => {
    if (await form.skip()) goToQuestions();
  };

  // Tell screen reader users about validation messages as they appear.
  const message = form.errors.name ?? form.errors.phone ?? form.errors.email;
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Add a Support Person
        </Text>

        <QuestionHintBanner message={INTRO} />

        {form.loadStatus === 'loading' ? <LoadingState label="Loading support people" /> : null}

        {form.loadStatus === 'error' ? (
          <ErrorState message="We could not load the support people." onRetry={form.reload} />
        ) : null}

        {form.loadStatus === 'ready' ? (
          <>
            <SupportPersonList people={form.people} onRemove={form.removePerson} />

            <Card style={styles.card}>
              <SupportPersonForm
                draft={form.draft}
                errors={form.errors}
                onChange={form.updateDraft}
                onBlurField={form.blurField}
              />
              <Button
                label="Add another person"
                variant="elevated"
                disabled={form.saving}
                onPress={form.addAnother}
                style={styles.addAnother}
              />
            </Card>
          </>
        ) : null}

        {form.saveError ? (
          <ErrorState
            message="We could not save the support person."
            onRetry={save}
            retryLabel="Try saving again"
          />
        ) : null}
      </ScrollView>

      <SupportPersonActionBar saving={form.saving} onSkip={skip} onSave={save} />
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
    fontWeight: '700',
    color: Colors.light.text,
  },
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
  },
  addAnother: {
    alignSelf: 'stretch',
  },
});
