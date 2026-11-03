import type { ReactNode } from 'react';
import { View } from 'react-native';


import { makeStyles, Spacing } from '@/constants/theme';
import { ScreenTitle } from '@/components/ui/nativeHeader';
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
    <>
      <ScreenTitle title={title} />
      {titleAccessory ? <View style={styles.titleRow}>{titleAccessory}</View> : null}
    </>
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
}));
