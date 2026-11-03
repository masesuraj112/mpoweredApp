import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { useOnboarding } from '@/context/Onboarding-Context';

export default function OtherConditionsScreen() {
  const { data, updateData } = useOnboarding();
  const [text, setText] = useState(data.otherConditions);
  const { noDiagnosis } = useLocalSearchParams<{ noDiagnosis?: string }>();
  const isNoDiagnosisPath = noDiagnosis === '1';
  const doneBar = useKeyboardDoneBar();

  const handleContinue = () => {
    updateData({ otherConditions: text.trim() });
    router.push('/(auth)/login-bridge');
  };

  return (
    <AuthScreen>
      <AuthTitle>
        {isNoDiagnosisPath ? "Tell us what you're experiencing" : 'Do you have any other conditions?'}
      </AuthTitle>
      <AppText variant="bodyMediumRegular" color="textSecondary" style={styles.centered}>
        {isNoDiagnosisPath
          ? // DRAFT COPY — please review/replace before shipping
            "No diagnosis yet? That's okay — describe what you're feeling in your own words, and MPowered will still work for you."
          : "If none, press 'Continue'"}
      </AppText>
      <AuthInput
        accessibilityLabel={isNoDiagnosisPath ? 'Your symptoms' : 'Other conditions'}
        value={text}
        onChangeText={setText}
        placeholder={
          isNoDiagnosisPath ? "Describe your symptoms or how you're feeling" : 'Type conditions or symptoms that you know'
        }
        multiline
        // Return adds a new line, so add a Done bar to close the keyboard.
        inputAccessoryViewID={doneBar.id}
      />
      {doneBar.bar}
      <AuthButton label="Continue" onPress={handleContinue} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
