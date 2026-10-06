import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function LoginBridgeScreen() {
  const { data } = useOnboarding();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;

  const handleContinue = () => router.push('/(auth)/phone');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
          },
        ]}
      >
        <View
          style={[
            styles.copy,
            {
              top: 136 * scale,
              left: 41 * scale,
              width: 313 * scale,
              height: 300 * scale,
            },
          ]}
        >
          <Text style={[styles.greeting, { fontSize: 22 * scale, lineHeight: 28 * scale }]}>
            Thank you, {data.name || 'there'} 😃
          </Text>
          <Text style={[styles.message, { fontSize: 22 * scale, lineHeight: 28 * scale }]}>
            {"Finally, let’s link this\ninformation to your account so\nthe next time you open this app,\nyou can just log in"}
          </Text>
        </View>
        <Pressable
          style={[
            styles.continueButton,
            {
              left: 40 * scale,
              top: 412 * scale,
              width: 333 * scale,
              height: 48 * scale,
              borderRadius: 12 * scale,
            },
          ]}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, { fontSize: 14 * scale, lineHeight: 20 * scale }]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  copy: {
    position: 'absolute',
    justifyContent: 'center',
  },
  greeting: {
    color: '#1D1B20',
    fontWeight: '500',
    marginBottom: 28,
  },
  message: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
  },
});
