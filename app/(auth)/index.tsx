import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';


const HAS_ONBOARDED_KEY = 'mpowered:hasOnboarded';

export default function SplashScreen() {
  useEffect(() => {
    const decideRoute = async () => {
      // TODO: replace with real returning-user/session check
      const hasOnboarded = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
      setTimeout(() => {
        router.replace(hasOnboarded ? '/(auth)/verify' : '/(auth)/onboarding');
      }, 1500);
    };
    decideRoute();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}> MPowered</Text>
      <Text style={styles.subtitle}> Powered by Musculoskeletal Health Australia</Text>
    </View>
  );
  }

// Placeholder, will update later on when design has finalised
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#666',
  },
});