import { useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { CalendarMonth } from '@/components/ui/CalendarMonth';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { TimeWheel, type WheelItem } from '@/components/ui/TimeWheel';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import {
  addMonths,
  defaultDateTime,
  MINUTE_STEP,
  MONTH_NAMES,
  snapMinute,
  to12Hour,
  to24Hour,
  toCalendarDay,
  type CalendarDay,
  type LocalDateTime,
  type Meridiem,
} from '@/features/care-planner/dateTime';

type DateTimePickerModalProps = {
  /** The value being edited, or null when nothing has been chosen yet. */
  value: LocalDateTime | null;
  /** Today's date and time. Injectable so tests are deterministic. */
  now?: Date;
  onConfirm: (value: LocalDateTime) => void;
  onCancel: () => void;
};

type Panel = 'days' | 'months' | 'years';

const HOUR_ITEMS: WheelItem[] = Array.from({ length: 12 }, (_, i) => ({
  key: String(i + 1),
  label: String(i + 1),
}));
const MINUTE_VALUES = Array.from({ length: 60 / MINUTE_STEP }, (_, i) => i * MINUTE_STEP);
const MINUTE_ITEMS: WheelItem[] = MINUTE_VALUES.map((minute) => ({
  key: String(minute),
  label: String(minute).padStart(2, '0'),
}));
const MERIDIEM_ITEMS: WheelItem[] = [
  { key: 'AM', label: 'AM' },
  { key: 'PM', label: 'PM' },
];

/**
 * A card over the form for choosing a date and a time. Opening with no value suggests today at
 * 9:00 AM, but nothing is committed until OK. Cancel (and Android back) discards.
 */
export function DateTimePickerModal({ value, now, onConfirm, onCancel }: DateTimePickerModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const start = useMemo(() => value ?? defaultDateTime(now ?? new Date()), [value, now]);
  const today = useMemo(() => toCalendarDay(now ?? new Date()), [now]);

  const [selected, setSelected] = useState<CalendarDay>({
    year: start.year,
    month: start.month,
    day: start.day,
  });
  const [visible, setVisible] = useState({ year: start.year, month: start.month });
  const [panel, setPanel] = useState<Panel>('days');

  const initialTime = to12Hour(start.hour);
  const [hour12, setHour12] = useState(initialTime.hour);
  const [minute, setMinute] = useState(snapMinute(start.minute));
  const [meridiem, setMeridiem] = useState<Meridiem>(initialTime.meridiem);

  const changeMonth = (delta: number) => {
    const next = addMonths(visible.year, visible.month, delta);
    setVisible(next);
    AccessibilityInfo.announceForAccessibility(`${MONTH_NAMES[next.month - 1]} ${next.year}`);
  };

  const confirm = () => {
    onConfirm({ ...selected, hour: to24Hour(hour12, meridiem), minute });
  };

  const monthName = MONTH_NAMES[visible.month - 1];
  const thisYear = today.year;
  const firstYear = Math.min(thisYear - 5, visible.year);
  const years = Array.from({ length: Math.max(thisYear + 10, visible.year) - firstYear + 1 }, (_, i) => firstYear + i);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View
          accessibilityViewIsModal
          style={[styles.card, { maxHeight: windowHeight * 0.92 }]}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <NavButton label="Previous month" onPress={() => changeMonth(-1)}>
                <ChevronLeftIcon />
              </NavButton>

              <View style={styles.headerSelects}>
                <HeaderSelect
                  label={`Month, ${monthName}`}
                  text={monthName.slice(0, 3)}
                  expanded={panel === 'months'}
                  onPress={() => setPanel(panel === 'months' ? 'days' : 'months')}
                />
                <HeaderSelect
                  label={`Year, ${visible.year}`}
                  text={String(visible.year)}
                  expanded={panel === 'years'}
                  onPress={() => setPanel(panel === 'years' ? 'days' : 'years')}
                />
              </View>

              <NavButton label="Next month" onPress={() => changeMonth(1)}>
                <ChevronRightIcon />
              </NavButton>
            </View>

            {panel === 'days' ? (
              <CalendarMonth
                year={visible.year}
                month={visible.month}
                selected={selected}
                today={today}
                onSelect={setSelected}
              />
            ) : null}

            {panel === 'months' ? (
              <View style={styles.monthGrid}>
                {MONTH_NAMES.map((name, index) => {
                  const isCurrent = index + 1 === visible.month;
                  return (
                    <Pressable
                      key={name}
                      accessibilityRole="button"
                      accessibilityLabel={name}
                      accessibilityState={{ selected: isCurrent }}
                      onPress={() => {
                        setVisible({ year: visible.year, month: index + 1 });
                        setPanel('days');
                      }}
                      style={[styles.monthCell, isCurrent && styles.monthCellSelected]}>
                      <Text style={[styles.monthText, isCurrent && styles.monthTextSelected]}>
                        {name.slice(0, 3)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {panel === 'years' ? (
              <ScrollView style={styles.yearList} nestedScrollEnabled>
                {years.map((year) => {
                  const isCurrent = year === visible.year;
                  return (
                    <Pressable
                      key={year}
                      accessibilityRole="button"
                      accessibilityLabel={String(year)}
                      accessibilityState={{ selected: isCurrent }}
                      onPress={() => {
                        setVisible({ year, month: visible.month });
                        setPanel('days');
                      }}
                      style={[styles.yearRow, isCurrent && styles.monthCellSelected]}>
                      <Text style={[styles.monthText, isCurrent && styles.monthTextSelected]}>
                        {year}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            <View style={styles.divider} />

            <Text accessibilityRole="header" style={styles.timeHeading}>
              Time
            </Text>
            <View style={styles.wheels}>
              <TimeWheel
                label="Hour"
                items={HOUR_ITEMS}
                selectedIndex={hour12 - 1}
                onChange={(index) => setHour12(index + 1)}
              />
              <TimeWheel
                label="Minute"
                items={MINUTE_ITEMS}
                selectedIndex={Math.max(0, MINUTE_VALUES.indexOf(minute))}
                onChange={(index) => setMinute(MINUTE_VALUES[index])}
              />
              <TimeWheel
                label="AM or PM"
                items={MERIDIEM_ITEMS}
                selectedIndex={meridiem === 'AM' ? 0 : 1}
                onChange={(index) => setMeridiem(index === 0 ? 'AM' : 'PM')}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Button label="Cancel" variant="outlined" onPress={onCancel} />
            <Button label="OK" accessibilityLabel="Confirm date and time" variant="primary" onPress={confirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NavButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.navButton}>
      {children}
    </Pressable>
  );
}

function HeaderSelect({
  label,
  text,
  expanded,
  onPress,
}: {
  label: string;
  text: string;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={styles.headerSelect}>
      <Text style={styles.headerSelectText}>{text}</Text>
      <ChevronDownIcon size={16} />
    </Pressable>
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
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
  content: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  headerSelects: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  headerSelect: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.control - 2,
  },
  headerSelectText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.light.text,
  },
  navButton: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  monthCell: {
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.control - 2,
    backgroundColor: Colors.light.backgroundElement,
  },
  monthCellSelected: {
    backgroundColor: Colors.light.primaryContainer,
  },
  monthText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  monthTextSelected: {
    fontWeight: '700',
  },
  yearList: {
    maxHeight: 240,
  },
  yearRow: {
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.control - 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
    backgroundColor: Colors.light.outline,
  },
  timeHeading: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  wheels: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
