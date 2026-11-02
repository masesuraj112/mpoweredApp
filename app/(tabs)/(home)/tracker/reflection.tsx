import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { getWeeklyReflection, saveWeeklyReflection } from '@/services/home';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { makeStyles, useThemeColors } from '@/constants/theme';
export default function ReflectionScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
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
      router.replace('/home');
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
      router.replace('/home');
      return;
    }
    void saveAndLeave(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
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
            placeholderTextColor={colors.textSubtle}
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

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
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
    color: colors.textSecondary,
    fontSize: 28,
    lineHeight: 28,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  heading: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  description: {
    marginBottom: 20,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 220,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  loader: {
    marginTop: 40,
  },
  error: {
    marginTop: 12,
    color: colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderRadius: 100,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
}));
