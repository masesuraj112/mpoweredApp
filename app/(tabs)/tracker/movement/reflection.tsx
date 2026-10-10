import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import {
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const ACCESSORY_ID = 'reflectionDone';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={scaleHeight(109)}
        >
          <Text style={styles.pageTitle}>My Movement</Text>
          <ChoiceCard
            title="Reflection on your movement"
            prompt="Write any reflections of pain impacts on your mobility."
            questionNumber={7}
            totalQuestions={7}
            onPrevious={() => router.push('/tracker/movement/standing')}
            onRecord={() => router.push('/tracker/movement/summary')}
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
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flex: 1,
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