import { SettingsHome, type SettingsRowProps } from '@/components/settings/SettingsHome';
import { router } from 'expo-router';

const accountIcon = require('../../../assets/images/settings/account.svg');
const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const displayIcon = require('../../../assets/images/settings/display.svg');

// Support persons have no Notifications or Support Persons rows (Figma 3896-21559).
const SETTINGS_ROWS: SettingsRowProps[] = [
  { icon: '', asset: accountIcon, label: 'Account', onPress: () => router.push('/support-settings/profile') },
  {
    icon: '',
    asset: accountIcon,
    label: 'People you support',
    onPress: () => router.push('/support-settings/people-you-support'),
  },
  { icon: '', asset: displayIcon, label: 'Display', onPress: () => router.push('/support-settings/display') },
  { icon: '', asset: privacyIcon, label: 'Privacy/Data and Legal', onPress: () => router.push('/support-settings/legal') },
];

export default function SupportSettingsScreen() {
  return <SettingsHome rows={SETTINGS_ROWS} />;
}
