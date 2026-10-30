import { useAuth } from '@/context/AuthContext';
import type { WeeklyAssessmentId } from '@/features/assessments/homeProgress';
import { useWeeklyHomeProgress } from '@/features/assessments/useWeeklyHomeProgress';
import { formatDayMonth } from '@/features/assessments/week';
import { getGreeting } from '@/features/support-person/greeting';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = recordedAssessments.size;
  const hasReflection = reflection === 'complete';

  const openAssessment = (assessment: Assessment) => {
    if (!isProgressLoaded) return;
    router.push(assessment.route);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.greeting}>{getGreeting(name)}</Text>
          <Text style={styles.heading}>
            Let&apos;s build your M<Text style={styles.superscript}>Powered</Text>
            {' plan.'}
          </Text>
          <Text style={styles.description}>
            Assess your pain intensity and its impacts weekly to obtain your M
            <Text style={styles.descriptionSuperscript}>Powered</Text>
            {' plan'}
          </Text>
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

        <View style={styles.assessmentPanel}>
          <Text style={styles.panelHeading}>This week’s assessment</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 412,
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: Platform.OS === 'web' ? 90 : 39,
    paddingBottom: 12,
  },
  intro: {
    marginBottom: 16,
  },
  greeting: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  heading: {
    marginTop: 16,
    color: '#000000',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  superscript: {
    position: 'relative',
    top: -5,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  descriptionSuperscript: {
    position: 'relative',
    top: -4,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: '400',
  },
  description: {
    marginTop: 5,
    color: '#000000',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 5,
    backgroundColor: '#EADDFF',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#6750A4',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  progressError: {
    marginTop: 4,
    color: '#B3261E',
    fontSize: 12,
    lineHeight: 16,
  },
  assessmentPanel: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  panelHeading: {
    marginBottom: 16,
    color: '#1D1B20',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  assessmentList: {
    gap: 14,
  },
  assessmentRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  assessmentCopy: {
    flex: 1,
    gap: 2,
  },
  assessmentTitle: {
    color: '#1D1B20',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  updatedText: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  assessmentButton: {
    width: 105,
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 100,
  },
  recordButton: {
    borderColor: '#6750A4',
    backgroundColor: '#6750A4',
  },
  editButton: {
    borderColor: '#CAC4D0',
    backgroundColor: '#EADDFF',
  },
  assessmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  recordButtonText: {
    color: '#FFFFFF',
  },
  editButtonText: {
    color: '#49454F',
  },
  arrow: {
    fontSize: 18,
    lineHeight: 20,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  reflection: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  plus: {
    color: '#381E72',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
  reflectionText: {
    color: '#1D1B20',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  reflectionCopy: {
    flex: 1,
  },
  reflectionStatus: {
    color: '#49454F',
    fontSize: 11,
    lineHeight: 16,
  },
  reflectionCompleteIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  reflectionEdit: {
    color: '#49454F',
    fontSize: 13,
    fontWeight: '600',
  },
  supported: {
    marginTop: 'auto',
    paddingTop: 22,
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
