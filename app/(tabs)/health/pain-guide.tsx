import { SafeAreaView } from 'react-native-safe-area-context';
import EmbeddedSite from '@/components/ui/EmbeddedSite';

import { makeStyles } from '@/constants/theme';

const PAIN_GUIDE_URL = 'https://muscha.org/learn-about-your-condition/';

export default function PainGuideScreen() {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <EmbeddedSite uri={PAIN_GUIDE_URL} />
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
}));
