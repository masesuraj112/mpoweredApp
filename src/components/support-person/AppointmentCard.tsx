import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { displayOrPlaceholder } from '@/features/care-planner/planDisplay';
import { formatAppointmentTime } from '@/features/support-person/appointments';
import type { Appointment } from '@/features/support-person/types';

import { PillButton } from './PillButton';

const calendarIcon = require('../../../assets/images/support-person/calendar.svg');
const personIcon = require('../../../assets/images/support-person/person.svg');
const stethoscopeIcon = require('../../../assets/images/support-person/stethoscope.svg');

export type AppointmentAction = { label: string; onPress: () => void };

type AppointmentCardProps = {
  appointment: Appointment;
  /** Buttons shown bottom-right, top to bottom, e.g. "Add questions" then "Add doctor's answer". */
  actions?: AppointmentAction[];
};

/** Date, practitioner and health service, with optional action buttons (Figma 3911-24689). */
export function AppointmentCard({ appointment, actions = [] }: AppointmentCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={calendarIcon} style={styles.calendarIcon} contentFit="contain" accessibilityLabel="" />
        <AppText variant="labelLargeBold" color="onSurface" style={styles.text}>
          {formatAppointmentTime(appointment.dateTime)}
        </AppText>
      </View>

      <View style={styles.body}>
        <View style={styles.details}>
          <View style={styles.row}>
            <Image source={personIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.text}>
              {displayOrPlaceholder(appointment.practitionerName)}
            </AppText>
          </View>
          <View style={styles.row}>
            <Image source={stethoscopeIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <AppText variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.text}>
              {displayOrPlaceholder(appointment.healthService)}
            </AppText>
          </View>
        </View>

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action) => (
              <PillButton key={action.label} label={action.label} onPress={action.onPress} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.mid,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surfaceContainer,
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
  text: {
    flexShrink: 1,
  },
});
