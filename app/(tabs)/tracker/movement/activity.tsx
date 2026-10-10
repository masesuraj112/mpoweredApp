import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

const MAX_HOURS_PER_DAY = 24;

export default function ActivityScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleChangeText = (value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');

    if (digitsOnly !== '' && Number(digitsOnly) > MAX_HOURS_PER_DAY) {
      const message = `Please enter a number between 0 and ${MAX_HOURS_PER_DAY}.`;
      // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Invalid hours', message);
      }
      return;
    }

    updateAnswer('activeHours', digitsOnly === '' ? undefined : Number(digitsOnly));
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="General Movement Impacts"
          prompt={
            <Text style={styles.promptText}>
              On average, how many hours per day were you able to stay active or mobile last week?
            </Text>
          }
          questionNumber={1}
          totalQuestions={7}
          onRecord={() => router.push('/tracker/movement/general')}
          disabled={answers.activeHours === undefined}
          variant="painTracker"
          cardHeight={scaleHeight(516)}
        >
          <View style={styles.inputContent}>
            <TextInput
              accessibilityLabel="Hours able to stay active last week"
              value={answers.activeHours !== undefined ? String(answers.activeHours) : ''}
              onChangeText={handleChangeText}
              placeholder="input number only"
              placeholderTextColor="#B3B3B3"
              keyboardType="number-pad"
              style={styles.input}
            />
            <Text style={styles.helperText}>
              Stay active could mean doing your typical activities like working, driving, doing
              house chores, meeting with people, et cetera
            </Text>
          </View>
        </ChoiceCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  inputContent: {
    gap: scaleHeight(10),
  },
  input: {
    height: scaleHeight(48),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleWidth(16),
    color: '#1D1B20',
    fontSize: scaleFont(14),
  },
  helperText: {
    color: '#727272',
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
});