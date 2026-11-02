import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { makeStyles, Spacing, Typography } from '@/constants/theme';
import { describeAccess, describeContact } from '@/features/care-planner/supportPerson';
import type { SupportPerson } from '@/features/care-planner/types';

type SupportPersonListProps = {
  people: readonly SupportPerson[];
  onRemove: (index: number) => void;
};

/** The support people already added to this appointment, each with a Remove button. */
export function SupportPersonList({ people, onRemove }: SupportPersonListProps) {
  const styles = useStyles();
  if (people.length === 0) return null;

  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>
        Support people added
      </Text>
      {people.map((person, index) => {
        const contact = describeContact(person);
        return (
          <Card key={`${person.name}-${index}`} variant="muted" style={styles.row}>
            <View style={styles.details}>
              <Text style={styles.name}>{person.name}</Text>
              {contact ? <Text style={styles.detail}>{contact}</Text> : null}
              <Text style={styles.detail}>{describeAccess(person)}</Text>
            </View>
            <Button
              label="Remove"
              accessibilityLabel={`Remove ${person.name}`}
              variant="tonal"
              onPress={() => onRemove(index)}
            />
          </Card>
        );
      })}
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
