import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { Colors, MinTapTarget } from '@/constants/theme';
import type { DictationStatus } from '@/features/care-planner/voice-recording';

const microphoneIcon = require('../../../assets/images/care-planner/microphone.png');

const SIZE = 52;

type DictationButtonProps = {
  status: DictationStatus;
  onPress: () => void;
};

/**
 * The microphone control. While listening it becomes a filled stop button with a pulsing ring
 * (a still ring when the person has reduce motion turned on). The label says what a press does.
 */
export function DictationButton({ status, onPress }: DictationButtonProps) {
  const listening = status === 'listening';
  const busy = status === 'requestingPermission' || status === 'processing';
  const unavailable = status === 'unavailable';

  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReduceMotion(enabled))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!listening || reduceMotion) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, reduceMotion, pulse]);

  const ringStyle = reduceMotion
    ? styles.ringStill
    : {
        opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
      };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={listening ? 'Stop dictation' : 'Start dictation'}
      accessibilityHint={unavailable ? 'Dictation is not available' : undefined}
      accessibilityState={{ disabled: unavailable, busy, selected: listening }}
      disabled={unavailable || busy}
      onPress={onPress}
      style={[styles.target, unavailable && styles.unavailable]}>
      <View style={styles.wrapper}>
        {listening ? <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} /> : null}
        {listening ? (
          <View style={[styles.circle, styles.circleActive]}>
            <View style={styles.stopSquare} />
          </View>
        ) : (
          <Image
            source={microphoneIcon}
            contentFit="contain"
            style={styles.circle}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  circleActive: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.listening,
  },
  stopSquare: {
    width: 18,
    height: 18,
    borderRadius: 3,
    backgroundColor: Colors.light.onPrimary,
  },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.light.listening,
  },
  ringStill: {
    transform: [{ scale: 1.25 }],
    opacity: 0.6,
  },
  unavailable: {
    opacity: 0.4,
  },
});
