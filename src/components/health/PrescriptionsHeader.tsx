import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { makeStyles, Spacing } from '@/constants/theme';

type PrescriptionsHeaderProps = {
  title: string;
  /** Accepted for main's callers; the native header shows only the page title. */
  topBarLabel?: string;
  /** Optional content under the header, for example action chips. */
  titleAccessory?: ReactNode;
};

/** A My Health sub-page header: the title in the native header bar, with optional actions under it. */
export function PrescriptionsHeader({ title, titleAccessory }: PrescriptionsHeaderProps) {
  const styles = useStyles();
  return (
    <ScreenHeader title={title}>
      {titleAccessory ? <View style={styles.titleRow}>{titleAccessory}</View> : null}
    </ScreenHeader>
  );
}

const useStyles = makeStyles(() => ({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
  },
}));
