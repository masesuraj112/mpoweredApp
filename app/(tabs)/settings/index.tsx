import { SettingsHome, type SettingsRowProps } from '@/components/mpowered/SettingsHome';
import { router } from 'expo-router';

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const accountIcon = require('../../../assets/images/settings/account.svg');
const notificationsIcon = require('../../../assets/images/settings/notifications.svg');
const supportPersonsIcon = require('../../../assets/images/settings/support-persons.svg');
// Display is hidden until text size and dark mode work (see docs/settings-backend.md).
// const displayIcon = require('../../../assets/images/settings/display.svg');

const SETTINGS_ROWS: SettingsRowProps[] = [
  { icon: '', asset: accountIcon, label: 'Account', onPress: () => router.push('/settings/profile') },
  { icon: '', asset: notificationsIcon, label: 'Notifications', onPress: () => router.push('/settings/notifications') },
  { icon: '', asset: supportPersonsIcon, label: 'Support Persons', onPress: () => router.push('/settings/support-persons') },
  // { icon: '', asset: displayIcon, label: 'Display', onPress: () => router.push('/settings/display') },
  { icon: '', asset: privacyIcon, label: 'Privacy/Data and Legal', onPress: () => router.push('/settings/legal') },
];

export default function SettingsScreen() {
  return <SettingsHome rows={SETTINGS_ROWS} />;
}
