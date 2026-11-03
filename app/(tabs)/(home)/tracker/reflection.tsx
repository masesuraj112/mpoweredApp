import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { getWeeklyReflection, saveWeeklyReflection } from '@/services/home';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';

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

  const saveDisabled = isLoading || isSaving || !reflection.trim();
  const saveLabel = isComplete ? 'Save changes' : 'Save reflection';

  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Home"
        disabled={isSaving}
        onPress={goBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <AppText
          accessibilityElementsHidden
          importantForAccessibility="no"
          variant="headlineSmall"
          color="onSurfaceVariant"
        >
          ‹
        </AppText>
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          Back to Home
        </AppText>
      </Pressable>

      <AppText accessibilityRole="header" variant="headlineSmall" color="onSurface" style={styles.heading}>
        {isComplete ? 'Edit this week’s reflection' : 'This week’s reflection'}
      </AppText>
      <AppText variant="bodyMediumRegular" color="onSurfaceVariant" style={styles.description}>
        Write down anything you would like to remember or discuss with your care team.
        Going back to Home keeps your draft for this week.
      </AppText>

      {isLoading ? (
        <ActivityIndicator accessibilityLabel="Loading your reflection" style={styles.loader} />
      ) : (
        <TextInput
          accessibilityLabel="Weekly reflection"
          editable={!isSaving}
          multiline
          onChangeText={setReflection}
          placeholder="Write your reflection here..."
          placeholderTextColor={Colors.light.textSecondary}
          style={styles.input}
          textAlignVertical="top"
          value={reflection}
        />
      )}

      {error && (
        <AppText accessibilityRole="alert" variant="bodySmall" color="error" style={styles.error}>
          {error}
        </AppText>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={saveLabel}
        accessibilityState={{ disabled: saveDisabled }}
        disabled={saveDisabled}
        onPress={save}
        style={({ pressed }) => [
          styles.saveButton,
          saveDisabled && styles.saveButtonDisabled,
          pressed && styles.pressed,
        ]}
      >
        <AppText variant="labelLargeBold" color="onPrimary">
          {isSaving ? 'Saving…' : saveLabel}
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  heading: {
    marginBottom: Spacing.two,
  },
  description: {
    marginBottom: Spacing.three,
  },
  input: {
    ...Typography.bodyLarge,
    minHeight: 220,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outlineMedium,
    borderRadius: Radius.card,
    color: Colors.light.onSurface,
  },
  loader: {
    marginTop: Spacing.five,
  },
  error: {
    marginTop: Spacing.mid,
  },
  saveButton: {
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
