import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const ACCESSORY_ID = 'activityDone';

export default function ActivityScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      updateAnswer('activeHours', undefined);
      return;
    }
    updateAnswer('activeHours', Math.min(Number(digits), 24));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>My Movement</Text>
          <ChoiceCard
            title="General Movement Impacts"
            prompt="On average, how many hours per day were you able to stay active or mobile last week?"
            questionNumber={1}
            totalQuestions={7}
            onRecord={() => router.push('/tracker/movement/general')}
            disabled={answers.activeHours === undefined}
            variant="personalCare"
            style={{ flex: 1, height: undefined }}
          >
            <TextInput
              value={answers.activeHours?.toString() ?? ''}
              onChangeText={handleChange}
              keyboardType="number-pad"
              placeholder="Input number only"
              placeholderTextColor="#79747E"
              maxLength={2}
              style={styles.input}
              accessibilityLabel="Hours active per day"
              inputAccessoryViewID={ACCESSORY_ID}
            />
            <Text style={styles.helper}>
              Stay active could mean doing your typical activities like working, driving, doing
              house chores, meeting with people, et cetera.
            </Text>
          </ChoiceCard>
        </View>

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
    height: scaleHeight(56),
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(16),
    fontSize: scaleFont(16),
    color: '#1D1B20',
  },
  helper: {
    marginTop: scaleHeight(16),
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
    letterSpacing: 0.4,
    color: '#49454F',
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