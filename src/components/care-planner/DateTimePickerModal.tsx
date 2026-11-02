import { Host } from '@expo/ui';
import { DatePickerDialog, TimePickerDialog } from '@expo/ui/jetpack-compose';
import { DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';
import { useMemo, useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  defaultDateTime,
  formatLocalTimestamp,
  fromLocalDate,
  fromUtcMidnight,
  toLocalDate,
  toUtcMidnightString,
  type CalendarDay,
  type LocalDateTime,
} from '@/features/care-planner/dateTime';

type DateTimePickerModalProps = {
  /** The value being edited, or null when nothing has been chosen yet. */
  value: LocalDateTime | null;
  /** Today's date and time. Injectable so tests are deterministic. */
  now?: Date;
  onConfirm: (value: LocalDateTime) => void;
  onCancel: () => void;
};

/**
 * Choosing an appointment's date and time with the platform's own pickers. Opening with no value
 * suggests today at 9:00 AM, but nothing is committed until confirmed; cancelling discards.
 * - iOS: a card with the system calendar and time, and Cancel / OK.
 * - Android: Material's date dialog, then its time dialog.
 * Times are local wall-clock values throughout (see dateTime.ts).
 */
export function DateTimePickerModal(props: DateTimePickerModalProps) {
  return Platform.OS === 'android' ? <AndroidDateTimeDialogs {...props} /> : <IosDateTimeCard {...props} />;
}

function useStart(value: LocalDateTime | null, now: Date | undefined): LocalDateTime {
  return useMemo(() => value ?? defaultDateTime(now ?? new Date()), [value, now]);
}

function IosDateTimeCard({ value, now, onConfirm, onCancel }: DateTimePickerModalProps) {
  const start = useStart(value, now);
  const [selected, setSelected] = useState<Date>(() => toLocalDate(start));

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.card}>
          <Host matchContents seedColor={Colors.light.primary} style={styles.picker}>
            <DatePicker
              title="Appointment date and time"
              selection={selected}
              displayedComponents={['date', 'hourAndMinute']}
              onDateChange={setSelected}
              modifiers={[datePickerStyle('graphical')]}
            />
          </Host>
          <View style={styles.actions}>
            <Button label="Cancel" variant="outlined" onPress={onCancel} />
            <Button
              label="OK"
              accessibilityLabel="Confirm date and time"
              variant="primary"
              onPress={() => onConfirm(fromLocalDate(selected))}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AndroidDateTimeDialogs({ value, now, onConfirm, onCancel }: DateTimePickerModalProps) {
  const start = useStart(value, now);
  // The date is chosen first; the time dialog then opens on that day.
  const [day, setDay] = useState<CalendarDay | null>(null);

  return (
    <Host matchContents>
      {day === null ? (
        <DatePickerDialog
          initialDate={toUtcMidnightString(start)}
          color={Colors.light.primary}
          onDateSelected={(date) => setDay(fromUtcMidnight(date))}
          onDismissRequest={onCancel}
        />
      ) : (
        <TimePickerDialog
          initialDate={formatLocalTimestamp({ ...day, hour: start.hour, minute: start.minute })}
          color={Colors.light.primary}
          onDateSelected={(date) => onConfirm({ ...day, hour: date.getHours(), minute: date.getMinutes() })}
          onDismissRequest={onCancel}
        />
      )}
    </Host>
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
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.surface,
    overflow: 'hidden',
  },
  picker: {
    alignSelf: 'stretch',
    padding: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
