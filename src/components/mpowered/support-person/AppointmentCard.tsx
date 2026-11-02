import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { displayOrPlaceholder } from '@/features/care-planner/planDisplay';
import { formatAppointmentTime } from '@/features/support-person/appointments';
import type { Appointment } from '@/features/support-person/types';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { PillButton } from './PillButton';

const calendarIcon = require('../../../../assets/images/support-person/calendar.svg');
const personIcon = require('../../../../assets/images/support-person/person.svg');
const stethoscopeIcon = require('../../../../assets/images/support-person/stethoscope.svg');

export type AppointmentAction = { label: string; onPress: () => void };

type AppointmentCardProps = {
  appointment: Appointment;
  /** Buttons shown bottom-right, top to bottom, e.g. "Add questions" then "Add doctor's answer". */
  actions?: AppointmentAction[];
};

/** Date, practitioner and health service, with optional action buttons (Figma 3911-24689). */
export function AppointmentCard({ appointment, actions = [] }: AppointmentCardProps) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={calendarIcon} style={styles.calendarIcon} contentFit="contain" accessibilityLabel="" />
        <Text style={styles.date}>{formatAppointmentTime(appointment.dateTime)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.details}>
          <View style={styles.row}>
            <Image source={personIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <Text style={styles.detailText} numberOfLines={1}>
              {displayOrPlaceholder(appointment.practitionerName)}
            </Text>
          </View>
          <View style={styles.row}>
            <Image source={stethoscopeIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <Text style={styles.detailText} numberOfLines={1}>
              {displayOrPlaceholder(appointment.healthService)}
            </Text>
          </View>
        </View>

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map(action => (
              <PillButton key={action.label} label={action.label} onPress={action.onPress} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    paddingLeft: Spacing.two,
    paddingRight: Spacing.two,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  details: {
    flex: 1,
    gap: Spacing.one,
  },
  actions: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  // The SVGs are exported at these sizes, so don't stretch them.
  calendarIcon: {
    width: 13,
    height: 12,
  },
  icon: {
    width: 13,
    height: 13,
  },
  date: {
    flexShrink: 1,
    color: colors.onSurface,
    ...Typography.caption,
    fontWeight: '600',
  },
  detailText: {
    flexShrink: 1,
    color: colors.textSubtle,
    ...Typography.caption,
    letterSpacing: 0.4,
  },
}));
