import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOnboarding } from '@/context/Onboarding-Context';

import { ContentColumn, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

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
  const styles = useStyles();
  const { updateData } = useOnboarding();
  const [index, setIndex] = useState(0);
  const { width, height } = useWindowDimensions();
  // Android draws behind the system buttons, so keep the bottom controls above them.
  const { bottom: bottomInset } = useSafeAreaInsets();
  const scale = Math.min(width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasLeft = (width - canvasWidth) / 2;
  const canvasTop = Math.max(0, (height - 823 * scale) / 2);
  const imageStageHeight = canvasTop + 454 * scale;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageWidth = e.nativeEvent.layoutMeasurement.width || width;
    const newIndex = Math.max(0, Math.min(SLIDES.length - 1, Math.round(e.nativeEvent.contentOffset.x / pageWidth)));
    setIndex(newIndex);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={[styles.imagePager, { height: imageStageHeight }]}
      >
        {SLIDES.map((slide, slideIndex) => (
          <View key={slideIndex} style={[styles.imageSlide, { width, height: imageStageHeight }]}>
            {slide.images.map((image, imageIndex) => (
              <Image
                key={`${slideIndex}-${imageIndex}`}
                source={image.source}
                contentFit="contain"
                style={{
                  position: 'absolute',
                  left: canvasLeft + image.x * scale,
                  top: canvasTop + image.y * scale,
                  width: image.width * scale,
                  height: image.height * scale,
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.copyArea}>
        <Text accessibilityRole="header" style={styles.heading}>{SLIDES[index].heading}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      {/* Remember which one was tapped: after the code, the app checks it against the account (sign-up-sign-in-plan.md). */}
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={() => {
            updateData({ intent: 'sign-up' });
            router.push('/(auth)/user-type');
          }}
        >
          <Text style={styles.primaryButtonText}>Get started →</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.signInButton}
          onPress={() => {
            updateData({ intent: 'sign-in' });
            router.push('/(auth)/phone');
          }}
        >
          <Text style={styles.signIn}>Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
}


// Styles
const useStyles = makeStyles((colors) => ({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

  imagePager: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
  },

  imageSlide: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },

  copyArea: {
    flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.five,
    },

    heading: {
        ...Typography.title,
        color: colors.text,
        textAlign: 'center',
    },

    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.one,
        marginVertical: Spacing.three,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: Radius.pill,
        backgroundColor: colors.surfaceContainer,
    },

    dotActive: {
        width: 20,
        backgroundColor: colors.primaryDeep,
    },

    actions: {
        ...ContentColumn,
        paddingHorizontal: Spacing.four,
    },

    primaryButton: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        minHeight: MinTapTarget,
        borderRadius: Radius.pill,
        paddingHorizontal: Spacing.four,
        paddingVertical: Spacing.two,
        justifyContent: 'center',
        alignSelf: 'center',

    },

    primaryButtonText: {
        color: colors.onPrimary,
        fontWeight: '600',
        ...Typography.bodyLarge,
    },

    signInButton: {
        minHeight: MinTapTarget,
        justifyContent: 'center',
        marginBottom: Spacing.two,
    },

    signIn: {
        ...Typography.bodyLarge,
        fontWeight: '600',
        color: colors.primary,
        textAlign: 'center',
    },
}));