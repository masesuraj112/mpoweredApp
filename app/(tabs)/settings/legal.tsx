import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function LegalScreen() {
  return (
    <SettingsSubpage title="Privacy/Data and Legal">
      <View>
        <Pressable onPress={() => router.push('/settings/privacy')} style={settingsSubpageStyles.link}>
          <Text style={settingsSubpageStyles.linkText}>Privacy Policy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/settings/terms')} style={settingsSubpageStyles.link}>
          <Text style={settingsSubpageStyles.linkText}>Terms and Conditions</Text>
        </Pressable>
      </View>
    </SettingsSubpage>
  );
}
