import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';

export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

export const settingsSubpageStyles = StyleSheet.create({
  placeholder: {
    color: '#49454F',
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  link: {
    minHeight: scaleHeight(48),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  linkText: {
    color: '#6750A4',
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(12),
    paddingBottom: scaleHeight(16),
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(40),
  },
  backArrow: {
    color: '#49454F',
    fontSize: scaleFont(28),
    lineHeight: scaleFont(28),
    marginRight: scaleWidth(8),
  },
  backText: {
    color: '#49454F',
    fontSize: scaleFont(16),
  },
  title: {
    marginTop: scaleHeight(12),
    color: '#000000',
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  content: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(24),
  },
});
