import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, MinTapTarget } from '@/constants/theme';
import {
  buildMonthGrid,
  formatAccessibleDate,
  isSameDay,
  WEEKDAY_HEADINGS,
  type CalendarDay,
} from '@/features/care-planner/dateTime';

type CalendarMonthProps = {
  year: number;
  /** 1 to 12. */
  month: number;
  selected: CalendarDay | null;
  today: CalendarDay;
  onSelect: (day: CalendarDay) => void;
};

/**
 * A month of days, Monday first. The chosen day is a dark rounded square (as in the design) and
 * today is a purple circle with a white number. The leading days of the previous month are left
 * blank; the days of the next month that fill the last week are greyed and cannot be chosen.
 */
export function CalendarMonth({ year, month, selected, today, onSelect }: CalendarMonthProps) {
  const weeks = buildMonthGrid(year, month);

  return (
    <View>
      <View style={styles.row}>
        {WEEKDAY_HEADINGS.map((heading) => (
          <View key={heading} style={styles.cell}>
            <Text accessibilityElementsHidden importantForAccessibility="no" style={styles.heading}>
              {heading}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((cell, columnIndex) => {
            const key = `${cell.year}-${cell.month}-${cell.day}`;
            const isLeading = !cell.inMonth && weekIndex === 0;

            if (isLeading) return <View key={key} style={styles.cell} />;

            if (!cell.inMonth) {
              return (
                <View key={key} style={styles.cell}>
                  <Text
                    accessibilityElementsHidden
                    importantForAccessibility="no"
                    style={[styles.dayText, styles.dayTextOutside]}>
                    {cell.day}
                  </Text>
                </View>
              );
            }

            const isSelected = selected !== null && isSameDay(cell, selected);
            const isToday = isSameDay(cell, today);
            const spoken = `${formatAccessibleDate(cell)}${isToday ? ', today' : ''}`;

            return (
              <View key={`${key}-${columnIndex}`} style={styles.cell}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={spoken}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => onSelect({ year: cell.year, month: cell.month, day: cell.day })}
                  style={styles.dayTarget}>
                  <View
                    style={[
                      styles.day,
                      isToday && !isSelected && styles.dayToday,
                      isSelected && styles.daySelected,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        isToday && !isSelected && styles.dayTextOnAccent,
                        isSelected && styles.dayTextOnSelected,
                      ]}>
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const DAY_SIZE = 40;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.textSecondary,
  },
  dayTarget: {
    minWidth: MinTapTarget - 4,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    borderRadius: DAY_SIZE / 2,
    backgroundColor: Colors.light.primary,
  },
  daySelected: {
    borderRadius: 8,
    backgroundColor: Colors.light.calendarSelected,
  },
  dayText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  dayTextOutside: {
    color: Colors.light.textDisabled,
  },
  dayTextOnAccent: {
    fontWeight: '700',
    color: Colors.light.onPrimary,
  },
  dayTextOnSelected: {
    fontWeight: '700',
    color: Colors.light.onCalendarSelected,
  },
});
