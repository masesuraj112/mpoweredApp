import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import type { WeeklyAssessmentId } from '@/features/assessments/homeProgress';
import { useWeeklyHomeProgress } from '@/features/assessments/useWeeklyHomeProgress';
import { formatDayMonth } from '@/features/assessments/week';
import { getGreeting } from '@/features/support-person/greeting';

type Assessment = {
  id: WeeklyAssessmentId;
  title: string;
  route:
    | '/tracker/pain/location'
    | '/tracker/movement/activity'
    | '/tracker/personal-care/general'
    | '/tracker/social-health/social-life'
    | '/tracker/management/medication';
};

const ASSESSMENTS: Assessment[] = [
  { id: 'pain', title: 'My Pain', route: '/tracker/pain/location' },
  { id: 'movement', title: 'My Movement', route: '/tracker/movement/activity' },
  { id: 'personalCare', title: 'My Personal Care', route: '/tracker/personal-care/general' },
  { id: 'socialHealth', title: 'My Social Health', route: '/tracker/social-health/social-life' },
  { id: 'management', title: 'My Management', route: '/tracker/management/medication' },
];

export default function HomeScreen() {
  const name = useAuth().profile?.name ?? '';
  const {
    recorded: recordedAssessments,
    reflection,
    isLoaded: isProgressLoaded,
    error: progressError,
  } = useWeeklyHomeProgress();
  const progress = recordedAssessments.size;
  const hasReflection = reflection === 'complete';

  const openAssessment = (assessment: Assessment) => {
    if (!isProgressLoaded) return;
    router.push(assessment.route);
  };

  return (
    <Screen>
      <View style={styles.intro}>
        <AppText variant="bodyMedium">{getGreeting(name)}</AppText>
        <AppText accessibilityRole="header" variant="titleLarge" style={styles.heading}>
          Let&apos;s build your M
          <AppText variant="labelSmall" style={styles.superscript}>
            Powered
          </AppText>
          {' plan.'}
        </AppText>
        <AppText variant="bodyMediumRegular" style={styles.description}>
          Assess your pain intensity and its impacts weekly to obtain your M
          <AppText variant="labelSmall" style={styles.descriptionSuperscript}>
            Powered
          </AppText>
          {' plan'}
        </AppText>
      </View>

      <View
        accessible
        style={styles.progressSection}
        accessibilityLabel={`This week's progress: ${progress} of ${ASSESSMENTS.length} assessments`}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress / ASSESSMENTS.length) * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <AppText variant="labelMedium">This week&apos;s progress</AppText>
          <AppText variant="labelMedium">
            {progress}/{ASSESSMENTS.length} assessments
          </AppText>
        </View>
        {progressError && (
          <AppText variant="bodySmall" color="error" style={styles.progressError}>
            {progressError}
          </AppText>
        )}
      </View>

      <View style={styles.assessmentPanel}>
        <AppText accessibilityRole="header" variant="titleMedium" color="onSurface" style={styles.panelHeading}>
          This week’s assessment
        </AppText>
        <View style={styles.assessmentList}>
          {ASSESSMENTS.map((assessment) => {
            const recordedDate = recordedAssessments.get(assessment.id);
            const isRecorded = recordedDate !== undefined;
            return (
              <View key={assessment.id} style={styles.assessmentRow}>
                <View style={styles.assessmentCopy}>
                  <AppText variant="bodyMedium" color="onSurface">
                    {assessment.title}
                  </AppText>
                  {isRecorded && (
                    <AppText variant="labelSmall" color="textTertiary">
                      Recorded {formatDayMonth(recordedDate)}
                    </AppText>
                  )}
                </View>
                <Button
                  label={isRecorded ? 'Edit' : 'Record'}
                  accessibilityLabel={`${isRecorded ? 'Edit' : 'Record'} ${assessment.title}`}
                  variant={isRecorded ? 'tonal' : 'primary'}
                  pill
                  style={styles.assessmentButton}
                  trailingGlyph="→"
                  disabled={!isProgressLoaded}
                  onPress={() => openAssessment(assessment)}
                />
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasReflection ? 'Edit this week’s reflection' : 'Add a reflection for this week'}
        onPress={() => router.push('/tracker/reflection')}
        style={({ pressed }) => [styles.reflection, pressed && styles.pressed]}
      >
        <AppText
          accessibilityElementsHidden
          importantForAccessibility="no"
          variant="headlineSmall"
          color="primary"
        >
          {hasReflection ? '✓' : '+'}
        </AppText>
        <View style={styles.reflectionCopy}>
          <AppText variant="labelLargeBold" color="onSurface">
            {hasReflection ? 'Reflection added for this week' : 'Add a reflection for this week'}
          </AppText>
          {reflection === 'draft' && (
            <AppText variant="labelSmall" color="onSurfaceVariant">
              Draft saved
            </AppText>
          )}
        </View>
        {hasReflection && (
          <AppText variant="labelMedium" color="onSurfaceVariant">
            Edit →
          </AppText>
        )}
      </Pressable>

      <AppText variant="labelSmall" style={styles.supported}>
        Supported by ABBVIE
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginBottom: Spacing.three,
  },
  heading: {
    marginTop: Spacing.three,
  },
  // The "Powered" half of the brand name sits raised and small.
  superscript: {
    position: 'relative',
    top: -5,
  },
  descriptionSuperscript: {
    position: 'relative',
    top: -4,
  },
  description: {
    marginTop: Spacing.one,
  },
  progressSection: {
    marginBottom: Spacing.four,
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: Radius.small,
    backgroundColor: Colors.light.primaryContainer,
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.small,
    backgroundColor: Colors.light.primary,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  progressError: {
    marginTop: Spacing.one,
  },
  assessmentPanel: {
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  panelHeading: {
    marginBottom: Spacing.three,
  },
  assessmentList: {
    gap: Spacing.mid,
  },
  assessmentRow: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  assessmentCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  // Record and Edit are the same width, so the two columns line up.
  assessmentButton: {
    minWidth: 105,
  },
  pressed: {
    opacity: 0.8,
  },
  reflection: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.mid,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceGrouped,
  },
  reflectionCopy: {
    flex: 1,
  },
  supported: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
    textAlign: 'center',
  },
});
