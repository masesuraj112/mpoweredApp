import { useAuth } from '@/context/AuthContext';
import type { WeeklyAssessmentId } from '@/features/assessments/homeProgress';
import { useWeeklyHomeProgress } from '@/features/assessments/useWeeklyHomeProgress';
import { formatDayMonth } from '@/features/assessments/week';
import { getGreeting } from '@/features/support-person/greeting';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentColumn, Gradients, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { BrandText } from '@/components/brand/BrandText';
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
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const name = useAuth().profile?.name ?? '';
  const {
    recorded: recordedAssessments,
    reflection,
    isLoaded: isProgressLoaded,
    error: progressError,
  } = useWeeklyHomeProgress();
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = recordedAssessments.size;
  const hasReflection = reflection === 'complete';

  const openAssessment = (assessment: Assessment) => {
    if (!isProgressLoaded) return;
    router.push(assessment.route);
  };

  // White status bar text over the gradient while this screen shows; the app's default everywhere else.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    // The hero runs under the status bar, so only the bottom edge is kept clear here.
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Pulling down past the top shows the gradient's own colour, not the page, above the hero. */}
        <View style={styles.overscroll} />
        {/* The week at a glance, on the brand gradient, from the top of the screen to both edges. */}
        <LinearGradient
          colors={Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.heroContent}>
            <View style={styles.intro}>
              <Text style={styles.greeting}>{getGreeting(name)}</Text>
              <BrandText style={styles.heading}>{'Let’s build your MPowered plan.'}</BrandText>
              <BrandText style={styles.description}>
                {'Assess your pain intensity and its impacts weekly to obtain your MPowered plan.'}
              </BrandText>
            </View>

            <View
              style={styles.progressSection}
              accessibilityLabel={`This week's progress: ${progress} of 5 assessments`}
            >
              <View
                style={styles.progressTrack}
                onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
              >
                <View
                  style={[
                    styles.progressFill,
                    { width: trackWidth * (progress / ASSESSMENTS.length) },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>This week&apos;s progress</Text>
                <Text style={styles.progressLabel}>
                  {progress}/{ASSESSMENTS.length} assessments
                </Text>
              </View>
              {progressError && <Text style={styles.progressError}>{progressError}</Text>}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text accessibilityRole="header" style={styles.sectionHeading}>
            This week’s assessments
          </Text>
          <View style={styles.assessmentList}>
            {ASSESSMENTS.map((assessment) => {
              const recordedDate = recordedAssessments.get(assessment.id);
              const isRecorded = recordedDate !== undefined;
              return (
                <View key={assessment.id} style={styles.assessmentRow}>
                  <View style={styles.assessmentCopy}>
                    <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                    {isRecorded && (
                      <Text style={styles.updatedText}>Recorded {formatDayMonth(recordedDate)}</Text>
                    )}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${isRecorded ? 'Edit' : 'Record'} ${assessment.title}`}
                    disabled={!isProgressLoaded}
                    // The pill is 40 high; the slop makes the touch area the full 48.
                    hitSlop={(MinTapTarget - ASSESSMENT_BUTTON_HEIGHT) / 2}
                    onPress={() => openAssessment(assessment)}
                    style={({ pressed }) => [
                      styles.assessmentButton,
                      isRecorded ? styles.editButton : styles.recordButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.assessmentButtonText,
                        isRecorded ? styles.editButtonText : styles.recordButtonText,
                      ]}
                    >
                      {isRecorded ? 'Edit' : 'Record'}
                    </Text>
                    <Text
                      style={[
                        styles.arrow,
                        isRecorded ? styles.editButtonText : styles.recordButtonText,
                      ]}
                    >
                      →
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hasReflection ? 'Edit this week’s reflection' : 'Add a reflection for this week'}
            onPress={() => router.push('/tracker/reflection')}
            style={({ pressed }) => [styles.reflection, pressed && styles.buttonPressed]}
          >
            <Text style={[styles.plus, hasReflection && styles.reflectionCompleteIcon]}>
              {hasReflection ? '✓' : '+'}
            </Text>
            <View style={styles.reflectionCopy}>
              <Text style={styles.reflectionText}>
                {hasReflection ? 'Reflection added for this week' : 'Add a reflection for this week'}
              </Text>
              {reflection === 'draft' && <Text style={styles.reflectionStatus}>Draft saved</Text>}
            </View>
            {hasReflection && <Text style={styles.reflectionEdit}>Edit →</Text>}
          </Pressable>

          <Text style={styles.supported}>Supported by ABBVIE</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// The Record / Edit pill, and the cards that hold it: the pill plus the card's padding above and below.
const ASSESSMENT_BUTTON_HEIGHT = 40;
const ASSESSMENT_BUTTON_WIDTH = 104;
const ROW_MIN_HEIGHT = ASSESSMENT_BUTTON_HEIGHT + 2 * Spacing.two;

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
  },
  overscroll: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: Gradients.brand[0],
  },
  heroContent: {
    ...ContentColumn,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  body: {
    ...ContentColumn,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  intro: {
    marginBottom: Spacing.three,
  },
  greeting: {
    color: colors.onBrandMuted,
    ...Typography.titleSmall,
  },
  heading: {
    marginTop: Spacing.three,
    color: colors.onBrand,
    ...Typography.display,
  },
  description: {
    marginTop: Spacing.one,
    color: colors.onBrandMuted,
    ...Typography.bodySmall,
    letterSpacing: 0.25,
  },
  progressSection: {},
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: colors.brandTrack,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.onBrandMuted,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  progressLabel: {
    color: colors.onBrand,
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  progressError: {
    marginTop: Spacing.one,
    color: colors.onBrand,
    ...Typography.caption,
  },
  sectionHeading: {
    marginBottom: Spacing.three,
    color: colors.text,
    ...Typography.titleSmall,
  },
  assessmentList: {
    gap: Spacing.three,
  },
  assessmentRow: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  assessmentCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  assessmentTitle: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  updatedText: {
    color: colors.success,
    ...Typography.caption,
    letterSpacing: 0.3,
  },
  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    minHeight: ASSESSMENT_BUTTON_HEIGHT,
    // Record and Edit share one width (Record's) so the column of buttons lines up.
    minWidth: ASSESSMENT_BUTTON_WIDTH,
    backgroundColor: colors.surfaceContainer,
    // Both states carry the border so Edit and Record are the same size.
    borderWidth: 2,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    alignSelf: 'center',
  },
  recordButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  // A completed assessment's Edit: the Record colour as an outline, so it reads as a button on its card.
  editButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  assessmentButtonText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  recordButtonText: {
    color: colors.onPrimary,
  },
  editButtonText: {
    color: colors.onPrimaryContainer,
  },
  arrow: {
    color: colors.text,
    ...Typography.subtitle,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  // The same size and padding as an assessment card, and the same gap above it as between them.
  reflection: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  plus: {
    color: colors.primaryDeep,
    ...Typography.headline,
  },
  reflectionText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  reflectionCopy: {
    flex: 1,
  },
  reflectionStatus: {
    color: colors.textSecondary,
    ...Typography.caption,
  },
  reflectionCompleteIcon: {
    color: colors.text,
    ...Typography.title,
  },
  reflectionEdit: {
    color: colors.textSecondary,
    ...Typography.caption,
    fontWeight: '600',
  },
  supported: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
    color: colors.text,
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
}));
