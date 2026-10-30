import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { getWeeklyReflection, saveWeeklyReflection } from '@/services/home';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReflectionScreen() {
  const [reflection, setReflection] = useState('');
  // The text as last saved, so leaving without changes does not save again.
  const [savedText, setSavedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      setIsLoading(true);
      setError(null);
      getWeeklyReflection(getWeekStart(getLocalToday())).then((result) => {
        if (!isCurrent) return;
        if (result.ok) {
          const text = result.data?.entry ?? '';
          setReflection(text);
          setSavedText(text);
          setIsComplete(result.data?.isComplete ?? false);
          setLoadFailed(false);
        } else {
          setLoadFailed(true);
          setError('Your reflection could not be loaded. Please try again.');
        }
        setIsLoading(false);
      });
      return () => {
        isCurrent = false;
      };
    }, []),
  );

  /** Saves and goes home. A draft (Back to Home) leaves the reflection unfinished. */
  const saveAndLeave = async (complete: boolean) => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    const result = await saveWeeklyReflection(reflection, { isComplete: complete });
    if (result.ok) {
      router.replace('/(tabs)/home');
      return;
    }
    setError(
      result.error.detail === 'VALUE_TOO_LONG'
        ? result.error.message
        : 'Your reflection could not be saved. Please try again.',
    );
    setIsSaving(false);
  };

  const save = () => {
    if (!reflection.trim()) return;
    void saveAndLeave(true);
  };

  const goBack = () => {
    // Nothing new to keep (or the saved text never loaded, so it must not be overwritten).
    if (isLoading || loadFailed || !reflection.trim() || reflection.trim() === savedText.trim()) {
      router.replace('/(tabs)/home');
      return;
    }
    void saveAndLeave(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to Home"
          disabled={isSaving}
          onPress={goBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>

        <Text style={styles.heading}>
          {isComplete ? 'Edit this week’s reflection' : 'This week’s reflection'}
        </Text>
        <Text style={styles.description}>
          Write down anything you would like to remember or discuss with your care team.
          Going back to Home keeps your draft for this week.
        </Text>

        {isLoading ? (
          <ActivityIndicator accessibilityLabel="Loading your reflection" style={styles.loader} />
        ) : (
          <TextInput
            accessibilityLabel="Weekly reflection"
            editable={!isSaving}
            multiline
            onChangeText={setReflection}
            placeholder="Write your reflection here..."
            placeholderTextColor="#79747E"
            style={styles.input}
            textAlignVertical="top"
            value={reflection}
          />
        )}

        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isComplete ? 'Save changes' : 'Save reflection'}
          disabled={isLoading || isSaving || !reflection.trim()}
          onPress={save}
          style={({ pressed }) => [
            styles.saveButton,
            (isLoading || isSaving || !reflection.trim()) && styles.saveButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving…' : isComplete ? 'Save changes' : 'Save reflection'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backArrow: {
    marginRight: 8,
    color: '#49454F',
    fontSize: 28,
    lineHeight: 28,
  },
  backText: {
    color: '#49454F',
    fontSize: 16,
  },
  heading: {
    marginBottom: 8,
    color: '#1D1B20',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  description: {
    marginBottom: 20,
    color: '#49454F',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 220,
    padding: 16,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 12,
    color: '#1D1B20',
    fontSize: 16,
    lineHeight: 24,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    marginTop: 12,
    color: '#B3261E',
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 100,
    backgroundColor: '#6750A4',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
});
