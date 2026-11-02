import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

import { makeStyles } from '@/constants/theme';
interface PrescriptionsHeaderProps {
  title: string;
  /** Optional label shown on the right of the top bar, e.g. "Homescreen" */
  topBarLabel?: string;
  /** Optional content rendered to the right of the title, e.g. action chips */
  titleAccessory?: ReactNode;
}


export function PrescriptionsHeader({ title, topBarLabel, titleAccessory }: PrescriptionsHeaderProps) {
  const styles = useStyles();
  return (
    <View>
      <View style={styles.topBar}>
        {/* Back always returns to the start of My Health, however deep in the stack we are */}
        <Pressable
          style={styles.backRow}
          hitSlop={8}
          onPress={() => router.dismissTo('/health')}
          accessibilityRole="button"
          accessibilityLabel="Back to My Health"
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back to My Health</Text>
        </Pressable>
        {topBarLabel && <Text style={styles.topBarLabel}>{topBarLabel}</Text>}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleAccessory}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  topBar: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: scaleWidth(19),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLabel: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: colors.text,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backChevron: {
    fontSize: scaleFont(22),
    color: colors.textSecondary,
    marginRight: scaleWidth(2),
    marginTop: -2,
  },
  backText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: scaleHeight(20),
    marginHorizontal: scaleWidth(24),
  },
  title: {
    flexShrink: 1,
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: colors.text,
  },
}));
