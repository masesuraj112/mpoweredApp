import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

const pillIcon = require('../../../../assets/images/health/prescription-pill.svg');

interface Prescription {
  id: string;
  overline: string;
  name: string;
  frequency: string;
  supportingText: string;
  badge?: string;
}

// TODO: replace with a Supabase query once prescriptions are wired up, e.g.
// supabase.from('prescriptions').select('*').eq('users_id', userId)
const FAKE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'perindopril',
    overline: 'Overline',
    name: 'Perindopril arginine 5 mg',
    frequency: 'Once daily',
    supportingText: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
  },
  {
    id: 'candesartan',
    overline: 'Overline',
    name: 'Candesartan 16 mg',
    frequency: 'Once daily',
    supportingText: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
  },
  {
    id: 'amlodipine',
    overline: 'Overline',
    name: 'Amlodipine 5 mg',
    frequency: 'Once daily',
    supportingText: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
  },
  {
    id: 'vitamin-d3',
    overline: 'Overline',
    name: 'Vitamin D3 1000 IU',
    frequency: 'Once daily',
    badge: '100+',
    supportingText: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
  },
  {
    id: 'raloxifene',
    overline: 'Overline',
    name: 'Raloxifene 60 mg',
    frequency: 'Once daily',
    badge: '100+',
    supportingText: 'Supporting line text lorem ipsum dolor sit amet, consectetur.',
  },
];

const BLANK  = [];

export default function PrescriptionsScreen() {
  const prescriptions = FAKE_PRESCRIPTIONS;
  const isEmpty = prescriptions.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader title="My Prescriptions" />

        {isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.pillIconFrame}>
              <Image source={pillIcon} style={styles.pillIcon} contentFit="contain" />
            </View>
            <Text style={styles.emptyText}>Prescriptions list is empty</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => router.push('/health/prescriptions/add')}
            >
              <Text style={styles.addButtonText}>Add prescription</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.list}>
              {prescriptions.map((prescription, index) => (
                <View
                  key={prescription.id}
                  style={[styles.listItem, index === prescriptions.length - 1 && styles.listItemLast]}
                >
                  <View style={styles.listItemTextColumn}>
                    <Text style={styles.overline}>{prescription.overline}</Text>
                    <Text style={styles.name}>{prescription.name}</Text>
                    <Text style={styles.frequency}>{prescription.frequency}</Text>
                    <Text style={styles.supportingText}>{prescription.supportingText}</Text>
                  </View>
                  {prescription.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{prescription.badge}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            <Pressable
              style={styles.addPrescriptionsButton}
              onPress={() => router.push('/health/prescriptions/add')}
            >
              <Text style={styles.addPrescriptionsButtonText}>Add prescriptions</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const GROUPED_BACKGROUND = '#F2F2F7';
const OUTLINE_VARIANT = '#CAC4D0';
const PRIMARY_PURPLE = '#6750A4';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  emptyState: {
    alignItems: 'center',
    marginTop: scaleHeight(106),
    paddingHorizontal: scaleWidth(24),
  },
  // Bounding box of the 42x70 pill once rotated 42.22deg, as laid out in Figma.
  pillIconFrame: {
    width: scaleWidth(78),
    height: scaleWidth(80),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleHeight(25),
  },
  pillIcon: {
    width: scaleWidth(42),
    height: scaleWidth(70),
    transform: [{ rotate: '42.22deg' }],
  },
  emptyText: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    color: '#898A8D',
    textAlign: 'center',
    marginBottom: scaleHeight(23),
  },
  addButton: {
    width: scaleWidth(172),
    height: scaleHeight(35),
    backgroundColor: GROUPED_BACKGROUND,
    borderRadius: scaleWidth(12),
    paddingHorizontal: scaleWidth(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontWeight: '600',
    letterSpacing: 0.1,
    color: '#1D1B20',
  },
  list: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(24),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: OUTLINE_VARIANT,
    borderRadius: scaleWidth(8),
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OUTLINE_VARIANT,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemTextColumn: {
    flex: 1,
    paddingRight: scaleWidth(12),
  },
  overline: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    color: '#79747E',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: 'black',
    marginTop: scaleHeight(4),
  },
  frequency: {
    fontSize: scaleFont(13),
    fontWeight: '500',
    color: '#49454F',
    marginTop: scaleHeight(2),
  },
  supportingText: {
    fontSize: scaleFont(12),
    color: '#79747E',
    marginTop: scaleHeight(4),
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: GROUPED_BACKGROUND,
    borderRadius: scaleWidth(10),
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
  },
  badgeText: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    color: '#49454F',
  },
  addPrescriptionsButton: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(16),
    backgroundColor: PRIMARY_PURPLE,
    borderRadius: scaleWidth(10),
    paddingVertical: scaleHeight(14),
    alignItems: 'center',
  },
  addPrescriptionsButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: 'white',
  },
});
