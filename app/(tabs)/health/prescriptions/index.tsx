import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { healthLoadMessage } from '@/features/health-profile/messages';
import {
  formatFrequency,
  formatPrescriptionName,
  prescriptionErrorMessage,
  type Prescription,
} from '@/features/health-profile/prescriptions';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { deletePrescription, getPrescriptions } from '@/services/health';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

const pillIcon = require('../../../../assets/images/health/prescription-pill.svg');
const editIcon = require('../../../../assets/images/health/prescription-edit.svg');
const deleteIcon = require('../../../../assets/images/health/prescription-delete.svg');

function showMessage(title: string, message: string) {
  // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert(title, message);
}

const loadPrescriptions = () => getPrescriptions();

export default function PrescriptionsScreen() {
  const { state, setState, reload } = useFocusedQuery(loadPrescriptions);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const prescriptions = state.status === 'ready' ? state.data : [];
  const isEmpty = state.status === 'ready' && prescriptions.length === 0;

  const handleEdit = (prescription: Prescription) => {
    router.push({ pathname: '/health/prescriptions/add', params: { id: String(prescription.id) } });
  };

  const removePrescription = async (id: number) => {
    setDeletingId(id);
    const result = await deletePrescription(id);
    setDeletingId(null);
    if (!result.ok && result.error.code !== 'NOT_FOUND') {
      showMessage('Prescription not deleted', prescriptionErrorMessage(result.error));
      return;
    }
    // NOT_FOUND means it is already gone, so removing it from the list is still right
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', data: current.data.filter((prescription) => prescription.id !== id) }
        : current,
    );
  };

  const handleDelete = (prescription: Prescription) => {
    const message = `Remove ${formatPrescriptionName(prescription)} from your prescriptions?`;

    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
    if (Platform.OS === 'web') {
      if (window.confirm(message)) removePrescription(prescription.id);
      return;
    }

    Alert.alert('Delete prescription', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePrescription(prescription.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader title="My Prescriptions" />

        {state.status === 'loading' && <LoadingState label="Loading your prescriptions" />}
        {state.status === 'error' && (
          <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
        )}

        {state.status !== 'ready' ? null : isEmpty ? (
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
            <View style={styles.listFrame}>
              <View style={styles.list}>
                {prescriptions.map((prescription) => (
                  <View
                    key={prescription.id}
                    style={[styles.listItem, deletingId === prescription.id && styles.listItemDeleting]}
                  >
                    <View style={styles.listItemTextColumn}>
                      <Text style={styles.name}>{formatPrescriptionName(prescription)}</Text>
                      <Text style={styles.frequency}>{formatFrequency(prescription)}</Text>
                    </View>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleEdit(prescription)}
                      hitSlop={scaleWidth(8)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${formatPrescriptionName(prescription)}`}
                    >
                      <Image source={editIcon} style={styles.icon} contentFit="contain" />
                    </Pressable>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleDelete(prescription)}
                      disabled={deletingId !== null}
                      hitSlop={scaleWidth(8)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${formatPrescriptionName(prescription)}`}
                    >
                      <Image source={deleteIcon} style={styles.icon} contentFit="contain" />
                    </Pressable>
                  </View>
                ))}
              </View>
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
const GRAY_2 = '#AEAEB2';
const ON_SURFACE = '#1D1B20';

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
  listFrame: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(24),
    borderWidth: 1,
    borderColor: GRAY_2,
    borderRadius: scaleWidth(12),
    padding: scaleWidth(12),
  },
  list: {
    backgroundColor: 'white',
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
    minHeight: scaleHeight(56),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderBottomWidth: 1,
    borderBottomColor: OUTLINE_VARIANT,
  },
  listItemDeleting: {
    opacity: 0.4,
  },
  listItemTextColumn: {
    flex: 1,
  },
  name: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    fontWeight: '500',
    letterSpacing: 0.25,
    color: ON_SURFACE,
  },
  frequency: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    letterSpacing: 0.4,
    color: ON_SURFACE,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
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
