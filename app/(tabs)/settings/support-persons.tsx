import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalSection,
  SettingsModalToggleRow,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { useState } from 'react';
import { Alert, Text } from 'react-native';

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
const INITIAL_PEOPLE: SupportPerson[] = [
  { id: '1', name: 'John Doe', phone: '0400 000 000', email: 'john.doe@gmail.com', canAddQuestions: false, canAddAnswers: false },
  { id: '2', name: 'Jane Doe', phone: '0400 000 000', email: 'jane.doe@gmail.com', canAddQuestions: false, canAddAnswers: false },
];

export default function SupportPersonsScreen() {
  const [people, setPeople] = useState<SupportPerson[]>(INITIAL_PEOPLE);
  // The popup edits a copy ("draft") so Cancel discards changes. null = popup closed.
  const [draft, setDraft] = useState<SupportPerson | null>(null);

  const updateDraft = (patch: Partial<SupportPerson>) => setDraft(current => (current ? { ...current, ...patch } : current));

  const save = () => {
    if (draft) setPeople(current => current.map(person => (person.id === draft.id ? draft : person)));
    setDraft(null);
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
        <SettingsOption key={person.id} icon={accountIcon} label={person.name} onPress={() => setDraft({ ...person })} />
      ))}

      {/* Screenshot 1 */}
      {draft && (
        <SettingsModal visible title="Manage support person" scrollable onClose={() => setDraft(null)} onConfirm={save}>
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
              <SettingsModalActionRow label="Revoke all access" icon={deleteIcon} destructive onPress={revokeAllAccess} />
            </SettingsModalGroup>
          </SettingsModalSection>
        </SettingsModal>
      )}
    </SettingsSubpage>
  );
}

const styles = { sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 12 } };
