import {
  SettingsModal,
  SettingsModalActionRow,
  SettingsModalField,
  SettingsModalGroup,
  SettingsModalText,
} from '@/components/mpowered/SettingsModal';
import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { useAuth } from '@/context/AuthContext';
import { OTP_LENGTH } from '@/features/auth/otp';
import { formatForDisplay } from '@/features/auth/phone';
import { useAccountDeletion } from '@/features/settings/useAccountDeletion';
import { useExportMyData } from '@/features/settings/useExportMyData';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const exportIcon = require('../../../assets/images/settings/exportdata.svg');
const deleteIcon = require('../../../assets/images/settings/delete.svg');

// Alert.alert is a no-op on react-native-web, so fall back to the browser dialogs there.
function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert(title, message);
}

function confirmDestructive(title: string, message: string, actionLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: actionLabel, style: 'destructive', onPress: onConfirm },
  ]);
}

/** Shared by both apps: the support person Legal page re-exports this screen. */
export default function LegalScreen() {
  const { profile } = useAuth();
  const { exporting, exportData } = useExportMyData();
  const deletion = useAccountDeletion(profile?.phone ?? null);

  const handleExport = async () => {
    if (exporting) return;
    const errorMessage = await exportData();
    if (errorMessage) showMessage('Export failed', errorMessage);
  };

  // Step 1: say what will be deleted. Step 2: text a code to the account's own phone.
  const handleDelete = () => {
    if (deletion.busy) return;
    const message =
      profile?.userType === 'support_person'
        ? 'This deletes your account. The patients you support will no longer see you as their support person. This can’t be undone.'
        : 'This deletes your account and everything in it: your details, assessments, appointments and support persons. This can’t be undone.';
    confirmDestructive('Delete your account?', message, 'Continue', async () => {
      const errorMessage = await deletion.start();
      if (errorMessage) showMessage('Account deletion', errorMessage);
    });
  };

  const resendLabel =
    deletion.resendIn > 0 ? `Resend code in ${deletion.resendIn} s` : 'Resend code';

  return (
    <SettingsSubpage title="Privacy/Data and Legal">
      {/* Relative, so the support person app (which reuses this screen) opens its own privacy page. */}
      <SettingsOption icon={privacyIcon} label="View PP and T&Cs" onPress={() => router.push('./privacy')} />
      <SettingsOption
        icon={exportIcon}
        label={exporting ? 'Preparing your data…' : 'Export my data'}
        onPress={handleExport}
      />
      <SettingsOption icon={deleteIcon} label="Account deletion" onPress={handleDelete} destructive />

      {/* Step 3: enter the code. The server checks it against the account's phone before deleting. */}
      <SettingsModal
        visible={deletion.stage === 'code'}
        title="Confirm with a code"
        onClose={deletion.cancel}
        onConfirm={deletion.confirm}
        confirmLabel="Delete account"
        confirmDisabled={deletion.busy || deletion.code.length !== OTP_LENGTH}
        errorMessage={deletion.error}
      >
        <SettingsModalText>
          {`We’ve texted a code to ${profile?.phone ? formatForDisplay(profile.phone) : 'your phone'}. Enter it to delete your account.`}
        </SettingsModalText>
        <SettingsModalField
          label="Code"
          value={deletion.code}
          onChangeText={deletion.setCode}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={OTP_LENGTH}
          showEditIcon={false}
        />
        <SettingsModalGroup>
          <SettingsModalActionRow label={resendLabel} onPress={deletion.resend} />
        </SettingsModalGroup>
      </SettingsModal>
    </SettingsSubpage>
  );
}
