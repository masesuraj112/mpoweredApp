import {
  getWeeklyReflection,
  saveWeeklyReflection,
} from '@/features/assessments/homeProgress';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSavedReflection = reflection.trim().length > 0;

  useFocusEffect(
    useCallback(() => {
      let isCurrent = true;
      setIsLoading(true);
      setError(null);
      getWeeklyReflection()
        .then((savedReflection) => {
          if (isCurrent) setReflection(savedReflection);
        })
        .catch((loadError: unknown) => {
          if (!isCurrent) return;
          console.error('[Reflection] Failed to load the weekly reflection:', loadError);
          setError('Your reflection could not be loaded from this device.');
        })
        .finally(() => {
          if (isCurrent) setIsLoading(false);
        });
      return () => {
        isCurrent = false;
      };
    }, []),
  );

  const save = async () => {
    const trimmedReflection = reflection.trim();
    if (!trimmedReflection || isSaving) return;

    setIsSaving(true);
    setError(null);
    try {
      await saveWeeklyReflection(trimmedReflection);
      router.replace('/(tabs)/home');
    } catch (saveError) {
      console.error('[Reflection] Failed to save the weekly reflection:', saveError);
      setError('Your reflection could not be saved. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(tabs)/home')}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back to Home</Text>
        </Pressable>

        <Text style={styles.heading}>
          {hasSavedReflection ? 'Edit this week’s reflection' : 'This week’s reflection'}
        </Text>
        <Text style={styles.description}>
          Write down anything you would like to remember or discuss with your care team.
          Your reflection is saved on this device for this week.
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
          disabled={isLoading || isSaving || !reflection.trim()}
          onPress={save}
          style={({ pressed }) => [
            styles.saveButton,
            (isLoading || isSaving || !reflection.trim()) && styles.saveButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving…' : hasSavedReflection ? 'Save changes' : 'Save reflection'}
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
