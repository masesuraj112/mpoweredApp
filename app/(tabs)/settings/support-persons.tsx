import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalSection,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { validateEmail, validatePhone } from '@/services/validation';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');
const deleteIcon = require('../../../assets/images/settings/delete.svg');
const pencilIcon = require('../../../assets/images/settings/pencil.svg');

type SupportPerson = {
  id: string;
  name: string;
  phone: string;
  email: string;
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

// Placeholder data - replace with whatever you load from Supabase.
const EMPTY_PERSON: Omit<SupportPerson, 'id'> = {
  name: '',
  phone: '',
  email: '',
  canAddQuestions: false,
  canAddAnswers: false,
};

const INITIAL_PEOPLE: SupportPerson[] = [
  { id: '1', name: 'John Doe', phone: '0400 000 000', email: 'john.doe@gmail.com', canAddQuestions: false, canAddAnswers: false },
  { id: '2', name: 'Jane Doe', phone: '0400 000 000', email: 'jane.doe@gmail.com', canAddQuestions: false, canAddAnswers: false },
];

export default function SupportPersonsScreen() {
  const [people, setPeople] = useState<SupportPerson[]>(INITIAL_PEOPLE);
  // The popup edits a copy ("draft") so Cancel discards changes. null = popup closed.
  const [draft, setDraft] = useState<SupportPerson | null>(null);
  const [error, setError] = useState('');
  // A draft whose id isn't in the list yet came from "Add support person".
  const isNew = !!draft && !people.some(person => person.id === draft.id);

  const openDraft = (person: SupportPerson) => {
    setDraft({ ...person });
    setError('');
  };

  const closeDraft = () => {
    setDraft(null);
    setError('');
  };

  // Editing any field clears the previous error.
  const updateDraft = (patch: Partial<SupportPerson>) => {
    setDraft(current => (current ? { ...current, ...patch } : current));
    setError('');
  };

  const save = () => {
    if (!draft) return;
    const person = { ...draft, name: draft.name.trim(), phone: draft.phone.trim(), email: draft.email.trim() };
    if (!person.name) {
      setError('Please enter a name.');
      return;
    }
    if (!person.phone && !person.email) {
      setError('Please enter a phone number or email.');
      return;
    }
    // Both are optional individually, but whichever is filled in must be valid.
    const contactError =
      validatePhone(person.phone, { required: false }) || validateEmail(person.email, { required: false });
    if (contactError) {
      setError(contactError);
      return;
    }

    // TODO: save to Supabase (insert when isNew, otherwise update).
    setPeople(current => (isNew ? [...current, person] : current.map(p => (p.id === person.id ? person : p))));
    closeDraft();
  };

  const revokeAllAccess = () => {
    if (!draft) return;
    Alert.alert('Revoke all access?', `${draft.name} will be removed as a support person.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: () => {
          setPeople(current => current.filter(person => person.id !== draft.id));
          setDraft(null);
        },
      },
    ]);
  };

  return (
    <SettingsSubpage title="Support Persons">
      <Text style={styles.sectionTitle}>Manage support persons</Text>
      {people.map(person => (
        <SettingsOption key={person.id} icon={accountIcon} label={person.name} onPress={() => openDraft(person)} />
      ))}
      <Pressable
        // Placeholder id until Supabase assigns one.
        onPress={() => openDraft({ id: `new-${Date.now()}`, ...EMPTY_PERSON })}
        accessibilityRole="button"
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Add support person</Text>
      </Pressable>

      {/* Screenshot 1 */}
      {draft && (
        <SettingsModal
          visible
          title={isNew ? 'Add support person' : 'Manage support person'}
          confirmLabel={isNew ? 'Add' : 'Ok'}
          scrollable
          onClose={closeDraft}
          onConfirm={save}
          errorMessage={error}
        >
          <SettingsModalField label="Name" value={draft.name} onChangeText={name => updateDraft({ name })} />
          <SettingsModalField
            label="Phone number"
            value={draft.phone}
            onChangeText={phone => updateDraft({ phone })}
            keyboardType="phone-pad"
          />
          <SettingsModalField
            label="Email"
            value={draft.email}
            onChangeText={email => updateDraft({ email })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
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
