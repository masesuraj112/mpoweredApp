import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { BackBarHeader } from '@/components/ui/BackBar';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
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
      {/* Back always returns to the start of My Health, however deep in the stack we are */}
      <BackBarHeader label="Back to My Health" title={topBarLabel} onPress={() => router.dismissTo('/health')} />

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleAccessory}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
  },
  title: {
    flexShrink: 1,
    ...Typography.display,
    color: colors.text,
  },
}));
