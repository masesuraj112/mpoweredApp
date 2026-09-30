import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const HAS_ONBOARDED_KEY = 'mpowered:hasOnboarded';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;
  const canvasLeft = (width - canvasWidth) / 2;
  const canvasTop = (height - canvasHeight) / 2;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const decideRoute = async () => {
      const hasOnboarded = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
      if (cancelled) return;
      timeout = setTimeout(() => {
        router.replace(hasOnboarded ? '/(auth)/verify' : '/(auth)/onboarding');
      }, 1800);
    };
    decideRoute();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#40177F', '#321064', '#210044']}
      locations={[0, 0.56, 1]}
      style={styles.container}
    >
      <StatusBar hidden />
      <View style={[styles.canvas, { left: canvasLeft, top: canvasTop, width: canvasWidth, height: canvasHeight }]}>
        <Svg viewBox="0 0 412 823" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
          <Path
            d="M5 720 C97 737 152 659 217 598 C273 545 327 519 371 528"
            fill="none"
            stroke="#7655B5"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Path
            d="M24 751 C119 750 177 723 235 682 C294 639 348 594 407 607"
            fill="none"
            stroke="#7655B5"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Circle cx="27" cy="681.5" r="6.5" fill="#7655B5" />
          <Circle cx="60.5" cy="672.5" r="8.5" fill="#7655B5" />
          <Circle cx="94" cy="650" r="12" fill="#7655B5" />
          <Circle cx="117.5" cy="615.5" r="11.5" fill="#7655B5" />
          <Circle cx="143.5" cy="567" r="13.5" fill="#7655B5" />
          <Circle cx="172.5" cy="524.5" r="12.5" fill="#7655B5" />
          <Circle cx="215.5" cy="494.5" r="12.5" fill="#7655B5" />
          <Circle cx="266" cy="482.5" r="11.5" fill="#7655B5" />
          <Circle cx="317.5" cy="480.5" r="9.5" fill="#7655B5" />
          <Circle cx="358" cy="485" r="7" fill="#7655B5" />
        </Svg>

        <View style={[styles.welcomeGroup, { left: 39 * scale, top: 293 * scale }]}>
          <Text style={[styles.welcome, { fontSize: 34 * scale, lineHeight: 44 * scale }]}>Welcome to...</Text>
        </View>

        <View style={[styles.wordmark, { left: 106 * scale, top: 356 * scale, width: 205 * scale, height: 64 * scale }]}>
          <Text style={[styles.markM, { fontSize: 64 * scale, lineHeight: 64 * scale }]}>M</Text>
          <Text style={[styles.markPowered, { left: 57 * scale, top: 1 * scale, fontSize: 36 * scale, lineHeight: 42 * scale }]}>Powered</Text>
        </View>

        <View style={[styles.footer, { left: 78 * scale, bottom: 48 * scale, width: 256 * scale }]}>
          <Text style={[styles.footerTop, { fontSize: 14 * scale, lineHeight: 18 * scale }]}>Powered by</Text>
          <Text style={[styles.footerBottom, { fontSize: 14 * scale, lineHeight: 18 * scale }]}>Musculoskeletal Health Australia</Text>
        </View>

        <View style={[styles.homeIndicator, { width: 108 * scale, height: 4 * scale, bottom: 12 * scale }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#210044',
  },
  canvas: {
    position: 'absolute',
    overflow: 'hidden',
  },
  welcomeGroup: {
    position: 'absolute',
  },
  welcome: {
    color: '#D4C6E9',
    fontWeight: '600',
  },
  wordmark: {
    position: 'absolute',
  },
  markM: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  markPowered: {
    position: 'absolute',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    alignItems: 'center',
  },
  footerTop: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerBottom: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  homeIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});