import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmbeddedSite from '@/components/mpowered/EmbeddedSite';
import { BackBarHeader } from '@/components/ui/BackBar';
import { makeStyles } from '@/constants/theme';

const PAIN_GUIDE_URL = 'https://muscha.org/learn-about-your-condition/';

export default function PainGuideScreen() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {/* The guide fills the screen, so give a way back to wherever it was opened from */}
      <BackBarHeader onPress={() => (router.canGoBack() ? router.back() : router.replace('/health'))} />
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
