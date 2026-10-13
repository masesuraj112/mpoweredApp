import { Colors } from '@/constants/theme';
import { formatAppointmentTime } from '@/features/support-person/appointments';
import type { Appointment } from '@/features/support-person/types';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

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
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={calendarIcon} style={styles.calendarIcon} contentFit="contain" accessibilityLabel="" />
        <Text style={styles.date}>{formatAppointmentTime(appointment.startsAt)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.details}>
          <View style={styles.row}>
            <Image source={personIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <Text style={styles.detailText} numberOfLines={1}>
              {appointment.practitioner}
            </Text>
          </View>
          <View style={styles.row}>
            <Image source={stethoscopeIcon} style={styles.icon} contentFit="contain" accessibilityLabel="" />
            <Text style={styles.detailText} numberOfLines={1}>
              {appointment.healthService}
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

const styles = StyleSheet.create({
  card: {
    gap: scaleHeight(4),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(12),
    paddingLeft: scaleWidth(11),
    paddingRight: scaleWidth(10),
    borderRadius: scaleWidth(12),
    backgroundColor: Colors.light.surfaceContainer,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: scaleWidth(8),
  },
  details: {
    flex: 1,
    gap: scaleHeight(4),
  },
  actions: {
    alignItems: 'flex-end',
    gap: scaleHeight(5),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(8),
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
    color: Colors.light.onSurface,
    fontSize: scaleFont(13),
    fontWeight: '600',
    lineHeight: 19.5,
  },
  detailText: {
    flexShrink: 1,
    color: '#8E8E93',
    fontSize: scaleFont(12),
    lineHeight: 18,
    letterSpacing: 0.4,
  },
});
