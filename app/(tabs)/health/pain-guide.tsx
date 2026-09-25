import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmbeddedSite from '@/components/mpowered/EmbeddedSite';

const PAIN_GUIDE_URL = 'https://muscha.org/learn-about-your-condition/';

export default function PainGuideScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <EmbeddedSite uri={PAIN_GUIDE_URL} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
});
