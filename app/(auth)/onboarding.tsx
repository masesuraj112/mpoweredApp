import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

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
  const [index, setIndex] = useState(0);
  const { width, height } = useWindowDimensions();
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
    <View style={styles.container}>
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
        <Text style={styles.heading}>{SLIDES[index].heading}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.push('/(auth)/user-type')}>
        <Text style={styles.primaryButtonText}>Get started →</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/verify')}>
        <Text style={styles.signIn}>Sign in</Text>
      </Pressable>
    </View>
  );
}


// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

  imagePager: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
  },

  imageSlide: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  copyArea: {
    flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    heading: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },

    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginVertical: 16,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9D4E8',
    },

    dotActive: {
        width: 20,
        backgroundColor: '#3F2A7A',
    },

    primaryButton: {
        backgroundColor: '#5B3FA5',
        marginHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },

    signIn: {
        textAlign: 'center',
        fontWeight: '600',
        marginVertical: 16,
    }
});