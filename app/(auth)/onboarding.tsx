import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/AuthButton';
import { ARTWORK_HEIGHT, ARTWORK_WIDTH, OnboardingArtwork } from '@/components/auth/OnboardingArtwork';
import { AppText } from '@/components/ui/AppText';
import { PagerDots } from '@/components/ui/PagerDots';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/Onboarding-Context';

const SLIDES = [
  {
    heading: 'Track your pain and its impacts weekly',
    images: [
      { source: require('../../assets/onboarding/homescreen2.png'), x: 26, y: 175, width: 180, height: 355 },
      { source: require('../../assets/onboarding/homescreen-pain-chart.png'), x: 177, y: 132, width: 201, height: 322 },
    ],
  },
  {
    heading: 'Easily share your pain logs to your healthcare professionals',
    images: [
      { source: require('../../assets/onboarding/homescreen-pain-chart-2.png'), x: 31, y: 238, width: 186, height: 298 },
      { source: require('../../assets/onboarding/my-pain-profile.png'), x: 166, y: 184, width: 228, height: 435 },
      { source: require('../../assets/onboarding/paper-plane.png'), x: 11, y: 112, width: 206, height: 206 },
    ],
  },
  {
    heading: 'Get tailored questions to assist your medical consultation',
    images: [
      { source: require('../../assets/onboarding/appointment-empty-state.png'), x: 28, y: 227, width: 244, height: 310 },
      { source: require('../../assets/onboarding/doctor-suggestion.png'), x: 152, y: 154, width: 239, height: 398 },
    ],
  },
];

export default function OnboardingCarousel() {
  const { updateData } = useOnboarding();
  const [index, setIndex] = useState(0);
  // The room the pages have, measured so the artwork can be scaled to fit it.
  const [page, setPage] = useState({ width: 0, height: 0 });
  const pagerRef = useRef<ScrollViewInstance>(null);
  const scale = Math.min(page.width / ARTWORK_WIDTH, page.height / ARTWORK_HEIGHT);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPage({ width, height });
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageWidth = e.nativeEvent.layoutMeasurement.width || page.width;
    if (!pageWidth) return;
    const newIndex = Math.max(0, Math.min(SLIDES.length - 1, Math.round(e.nativeEvent.contentOffset.x / pageWidth)));
    setIndex(newIndex);
  };

  // Swiping is not the only way to move on: each dot goes to its slide.
  const goTo = (slideIndex: number) => {
    setIndex(slideIndex);
    pagerRef.current?.scrollTo({ x: slideIndex * page.width, animated: true });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.pager} onLayout={handleLayout}>
        {page.width > 0 && (
          <ScrollView
            ref={pagerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
          >
            {SLIDES.map((slide, slideIndex) => (
              <View key={slideIndex} style={[styles.page, { width: page.width, height: page.height }]}>
                <OnboardingArtwork images={slide.images} scale={scale} />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <AppText accessibilityRole="header" variant="titleLarge" style={styles.heading}>
          {SLIDES[index].heading}
        </AppText>

        <PagerDots count={SLIDES.length} activeIndex={index} onSelect={goTo} itemLabel="slide" />

        {/* Remember which one was tapped: after the code, the app checks it against the account (sign-up-sign-in-plan.md). */}
        <View style={styles.actions}>
          <AuthButton
            label="Get started →"
            onPress={() => {
              updateData({ intent: 'sign-up' });
              router.push('/(auth)/user-type');
            }}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              updateData({ intent: 'sign-in' });
              router.push('/(auth)/phone');
            }}
            style={styles.signIn}
          >
            <AppText variant="labelLargeBold" color="primary">
              Sign in
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pager: {
    flex: 1,
    minHeight: 0,
  },
  page: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  heading: {
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: Spacing.one,
  },
  signIn: {
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
