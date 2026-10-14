import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { appendDictatedText } from '@/features/care-planner/answerDrafts';
import type { AnswerInput, PlanQuestion } from '@/features/care-planner/planTypes';
import { useAnswerDrafts } from '@/features/care-planner/useAnswerDrafts';
import { useDictation, type DictationResult } from '@/features/care-planner/voice-recording';

import { AnswerModalActions } from './AnswerModalActions';
import { AnswerTextBox } from './AnswerTextBox';
import { DictationButton } from './DictationButton';
import { ListeningIndicator } from './ListeningIndicator';

type AnswerModalProps = {
  /** Every question that can be answered, in the order the arrows move through them. */
  questions: PlanQuestion[];
  /** The question the box opens on. */
  initialQuestionId: number;
  /** Saves the changed answers. Resolves true when saved; the box then closes. */
  onSave: (answers: AnswerInput[]) => Promise<boolean>;
  onClose: () => void;
};

const MIC_HINT = 'Press the microphone to change answer';

/**
 * Box over the review screen for recording the doctor's answer to a question, by typing or by
 * dictation. OK saves every answer edited this session; Cancel (and Android back) discards them,
 * asking first if there is unsaved text. The dimmed backdrop does not close the box.
 */
export function AnswerModal({ questions, initialQuestionId, onSave, onClose }: AnswerModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const drafts = useAnswerDrafts(questions, initialQuestionId);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // The question dictation started on, and the text it should be added after.
  const session = useRef<{ questionId: number; base: string } | null>(null);

  const dictation = useDictation({
    onResult: ({ text, isFinal }: DictationResult) => {
      const active = session.current;
      if (!active) return;
      if (isFinal) {
        active.base = appendDictatedText(active.base, text);
        drafts.setText(active.questionId, active.base);
      } else {
        drafts.setText(active.questionId, appendDictatedText(active.base, text));
      }
    },
  });
  const { status } = dictation;
  const listening = status === 'listening';

  // Announce which question is showing, and when dictation starts and stops.
  useEffect(() => {
    if (drafts.count > 0) {
      AccessibilityInfo.announceForAccessibility(`Question ${drafts.index + 1} of ${drafts.count}`);
    }
  }, [drafts.index, drafts.count]);

  const previousStatus = useRef(status);
  useEffect(() => {
    if (previousStatus.current !== 'listening' && status === 'listening') {
      AccessibilityInfo.announceForAccessibility('Listening');
    } else if (previousStatus.current === 'listening' && status !== 'listening') {
      AccessibilityInfo.announceForAccessibility('Dictation stopped');
    }
    previousStatus.current = status;
  }, [status]);

  // Stop dictating if the app goes to the background.
  const { abort } = dictation;
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') abort();
    });
    return () => subscription.remove();
  }, [abort]);

  const question = drafts.current;
  if (!question) return null;

  const toggleDictation = () => {
    if (listening) {
      dictation.stop();
      return;
    }
    session.current = { questionId: question.questionId, base: drafts.text };
    void dictation.start();
  };

  const changeText = (text: string) => {
    // Typing takes over from dictation so the two never fight over the text.
    if (listening) dictation.abort();
    drafts.setText(question.questionId, text);
  };

  const move = (go: () => void) => {
    dictation.stop();
    go();
  };

  const cancel = () => {
    dictation.abort();
    if (!drafts.dirty) {
      onClose();
      return;
    }
    Alert.alert('Discard your changes?', 'The answers you have typed or dictated will not be saved.', [
      { text: 'Keep editing', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          drafts.discard();
          onClose();
        },
      },
    ]);
  };

  const save = async () => {
    dictation.abort();
    if (drafts.changed.length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    setSaveFailed(false);
    const saved = await onSave(drafts.changed);
    setSaving(false);
    if (saved) onClose();
    else setSaveFailed(true);
  };

  const showSettings = dictation.canOpenSettings && dictation.issue === 'permission-blocked';

  return (
    <Modal transparent animationType="fade" visible onRequestClose={cancel} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          importantForAccessibility="yes"
          style={[styles.box, { maxHeight: windowHeight * 0.9 }]}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
            style={styles.scroll}>
            <AnswerTextBox
              question={question.text}
              value={drafts.text}
              onChangeText={changeText}
              listening={listening}
              editable={!saving}
            />

            <ListeningIndicator
              listening={listening}
              message={dictation.message}
              onOpenSettings={showSettings ? dictation.openSettings : undefined}
            />

            <View style={styles.micRow}>
              <DictationButton status={status} onPress={toggleDictation} />
              <Text style={styles.hint}>{MIC_HINT}</Text>
            </View>

            {saveFailed ? (
              <View style={styles.error}>
                <Text accessibilityRole="alert" style={styles.errorText}>
                  We could not save your answers.
                </Text>
                <Button label="Try again" variant="tonal" onPress={save} />
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <AnswerModalActions
              canGoPrevious={!drafts.isFirst}
              canGoNext={!drafts.isLast}
              onPrevious={() => move(drafts.previous)}
              onNext={() => move(drafts.next)}
              onCancel={cancel}
              onSave={save}
              saving={saving}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
    backgroundColor: Colors.light.backdrop,
  },
  box: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  micRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  hint: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: Colors.light.onSurface,
  },
  error: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.light.error,
  },
  actions: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
