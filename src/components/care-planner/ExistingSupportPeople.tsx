import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { makeStyles, Spacing, Typography } from '@/constants/theme';
import { describeAccess } from '@/features/care-planner/supportPerson';
import type { SupportPerson } from '@/features/care-planner/types';

type ExistingSupportPeopleProps = {
  people: readonly SupportPerson[];
  disabled?: boolean;
  onAdd: (person: SupportPerson) => void;
};

/** The patient's saved support people, each with an Add button, so nobody is typed in twice. */
export function ExistingSupportPeople({ people, disabled = false, onAdd }: ExistingSupportPeopleProps) {
  const styles = useStyles();
  if (people.length === 0) return null;

  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>
        Your saved support people
      </Text>
      {people.map((person) => (
        <Card key={person.supportPersonId} variant="muted" style={styles.row}>
          <View style={styles.details}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.detail}>{describeAccess(person)}</Text>
          </View>
          <Button
            label="Add"
            accessibilityLabel={`Add ${person.name} to this appointment`}
            variant="tonal"
            disabled={disabled}
            onPress={() => onAdd(person)}
          />
        </Card>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  list: {
    gap: Spacing.two,
  },
  heading: {
    ...Typography.labelLarge,
    color: colors.onSurface,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  details: {
    flexShrink: 1,
    gap: Spacing.half,
  },
  name: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    color: colors.onSurface,
  },
  detail: {
    ...Typography.caption,
    letterSpacing: 0.4,
    color: colors.onSurfaceVariant,
  },
}));
