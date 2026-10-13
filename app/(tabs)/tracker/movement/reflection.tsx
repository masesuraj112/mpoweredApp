import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { saveMovementEntry } from '@/services/assessments';
import { useRef, useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ACCESSORY_ID = 'reflectionDone';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const handleRecord = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    const entryDate = getLocalToday();
    const result = await saveMovementEntry(answers, entryDate);

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(assessmentSaveMessage(result.error, 'movement'));
      return;
    }
    router.push({
      pathname: '/tracker/movement/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={scaleHeight(109)}
      >
        {/* A wrapping Touchable steals taps from the TextInput (notably on web), so dismiss via ScrollView instead. */}
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.pageTitle}>My Movement</Text>
          <ChoiceCard
            title="Reflection on your movement"
            prompt="Write any reflections of pain impacts on your mobility."
            questionNumber={7}
            totalQuestions={7}
            onPrevious={() => router.push('/tracker/movement/standing')}
            onRecord={handleRecord}
            disabled={saving}
            validationMessage={errorMessage ?? undefined}
            variant="personalCare"
            style={{ flex: 1, height: undefined }}
          >
            <TextInput
              value={answers.reflection ?? ''}
              onChangeText={text => updateAnswer('reflection', text)}
              placeholder="For instance, when pain occurred, you lie down for the whole day"
              placeholderTextColor="#79747E"
              multiline
              textAlignVertical="top"
              style={styles.input}
              accessibilityLabel="Reflection on your movement"
              inputAccessoryViewID={ACCESSORY_ID}
            />
          </ChoiceCard>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <Pressable onPress={Keyboard.dismiss} accessibilityRole="button" accessibilityLabel="Done">
              <Text style={styles.accessoryDone}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flexGrow: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  input: {
    flex: 1,
    minHeight: scaleHeight(120),
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: scaleWidth(4),
    padding: scaleWidth(16),
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
    color: '#1D1B20',
  },
  accessoryBar: {
    alignItems: 'flex-end',
    backgroundColor: '#E8DEF8',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
  },
  accessoryDone: {
    color: '#6750A4',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});