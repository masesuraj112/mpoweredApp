import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalSection,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { formatForDisplay } from '@/features/auth/phone';
import { Colors } from '@/constants/theme';
import { carePlannerMessage } from '@/features/care-planner/messages';
import {
  EMPTY_SUPPORT_PERSON_DRAFT,
  invitationStatusLabel,
  toSupportPerson,
  validateSupportPerson,
  type SupportPersonDraft,
} from '@/features/care-planner/supportPerson';
import type { SupportPerson } from '@/features/care-planner/types';
import { useMySupportPersons } from '@/features/care-planner/useMySupportPersons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const deleteIcon = require('../../../assets/images/settings/delete.svg');

/** What the popup edits: the form values, plus which stored person it is (none for a new one). */
type PersonDraft = SupportPersonDraft & { supportPersonId?: number };

const draftFrom = (person: SupportPerson): PersonDraft => ({
  supportPersonId: person.supportPersonId,
  name: person.name,
  phone: person.phone === null ? '' : formatForDisplay(person.phone),
  email: person.email ?? '',
  canAddQuestions: person.canAddQuestions,
  canAddAnswers: person.canAddAnswers,
});

export default function SupportPersonsScreen() {
  const { state, reload, busy, actionError, clearActionError, save: savePerson, remove } =
    useMySupportPersons();
  // The popup edits a copy ("draft") so Cancel discards changes. null = popup closed.
  const [draft, setDraft] = useState<PersonDraft | null>(null);
  const [error, setError] = useState('');
  const isNew = !!draft && draft.supportPersonId === undefined;

  const openDraft = (next: PersonDraft) => {
    setDraft({ ...next });
    setError('');
    clearActionError();
  };

  const closeDraft = () => {
    setDraft(null);
    setError('');
    clearActionError();
  };

  // Editing any field clears the previous error.
  const updateDraft = (patch: Partial<PersonDraft>) => {
    setDraft(current => (current ? { ...current, ...patch } : current));
    setError('');
    clearActionError();
  };

  const save = async () => {
    if (!draft) return;
    const found = validateSupportPerson(draft, people, draft.supportPersonId);
    const problem = found.name ?? found.phone ?? found.email;
    if (problem) {
      setError(problem);
      return;
    }
    if (!draft.phone.trim() && !draft.email.trim()) {
      setError('Please enter a phone number or email.');
      return;
    }
    const saved = await savePerson({ ...toSupportPerson(draft), supportPersonId: draft.supportPersonId });
    if (saved) closeDraft();
  };

  const revokeAllAccess = () => {
    if (!draft || draft.supportPersonId === undefined) return;
    const { supportPersonId, name } = draft;
    Alert.alert(
      'Revoke all access?',
      `${name} will be removed as a support person and lose access straight away.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            if (await remove(supportPersonId)) closeDraft();
          },
        },
      ],
    );
  };

  const people = state.status === 'ready' ? state.data : [];

  return (
    <SettingsSubpage title="Support Persons">
      <Text style={styles.sectionTitle}>Manage support persons</Text>
      {state.status === 'loading' && <LoadingState label="Loading support persons" />}
      {state.status === 'error' && (
        <ErrorState message="We could not load your support persons." onRetry={reload} />
      )}
      {state.status === 'ready' && people.length === 0 && (
        <EmptyState message="You have not added a support person yet." />
      )}
      {people.map(person => {
        // Pending until they accept; declined if they rejected or unpaired (they can be added again).
        const status = invitationStatusLabel(person.status);
        return (
          <SettingsOption
            key={person.supportPersonId}
            icon={accountIcon}
            label={person.name}
            accessibilityLabel={status ? `${person.name}, ${status}` : person.name}
            trailing={status ? <Text style={styles.status}>{status} →</Text> : undefined}
            onPress={() => openDraft(draftFrom(person))}
          />
        );
      })}
      {state.status === 'ready' && (
        <Pressable
          onPress={() => openDraft({ ...EMPTY_SUPPORT_PERSON_DRAFT })}
          accessibilityRole="button"
          accessibilityLabel="Add support person"
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add support person</Text>
        </Pressable>
      )}

      {draft && (
        <SettingsModal
          visible
          title={isNew ? 'Add support person' : 'Manage support person'}
          confirmLabel={isNew ? 'Add' : 'Ok'}
          confirmDisabled={busy}
          scrollable
          onClose={closeDraft}
          onConfirm={save}
          errorMessage={error || (actionError ? carePlannerMessage(actionError) : '')}
        >
          <SettingsModalField
            label="Name"
            value={draft.name}
            onChangeText={name => updateDraft({ name })}
            maxLength={100}
          />
          <SettingsModalField
            label="Phone number"
            value={draft.phone}
            onChangeText={phone => updateDraft({ phone })}
            keyboardType="phone-pad"
            maxLength={20}
          />
          <SettingsModalField
            label="Email"
            value={draft.email}
            onChangeText={email => updateDraft({ email })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={254}
          />
          <SettingsModalSection title="Access permissions">
            <SettingsModalGroup>
              <SettingsModalToggleRow
                label="Add questions"
                value={draft.canAddQuestions}
                onValueChange={canAddQuestions => updateDraft({ canAddQuestions })}
              />
              <SettingsModalToggleRow
                label="Add doctor’s answers"
                value={draft.canAddAnswers}
                onValueChange={canAddAnswers => updateDraft({ canAddAnswers })}
              />
              {!isNew && (
                <SettingsModalActionRow label="Revoke all access" icon={deleteIcon} destructive onPress={revokeAllAccess} />
              )}
            </SettingsModalGroup>
          </SettingsModalSection>
        </SettingsModal>
      )}
    </SettingsSubpage>
  );
}

const styles = StyleSheet.create({
  status: {
    color: Colors.light.onSurfaceVariant,
    fontSize: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  // Same as the Sign out button on the Account page.
  addButton: {
    height: 55,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#6750A4',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
});
