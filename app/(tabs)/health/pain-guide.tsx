import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmbeddedSite from '@/components/mpowered/EmbeddedSite';
import { BackButton } from '@/components/ui/BackButton';
import { Spacing } from '@/constants/theme';

const PAIN_GUIDE_URL = 'https://muscha.org/learn-about-your-condition/';

export default function PainGuideScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* The guide fills the screen, so give a way back to wherever it was opened from */}
      <View style={styles.topBar}>
        <BackButton
          onPress={() => {
            if (from === 'planner') router.navigate('/planner');
            else if (router.canGoBack()) router.back();
            else router.replace('/health');
          }}
        />
      </View>
      <EmbeddedSite uri={PAIN_GUIDE_URL} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
