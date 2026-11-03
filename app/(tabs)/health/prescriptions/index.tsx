import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { PrescriptionsHeader } from '@/components/health/PrescriptionsHeader';
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

import { ContentColumn, makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
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
  const styles = useStyles();
  const colors = useThemeColors();
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
    <>
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <PrescriptionsHeader title="My Prescriptions" />

        {state.status === 'loading' && <LoadingState label="Loading your prescriptions" />}
        {state.status === 'error' && (
          <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
        )}

        {state.status !== 'ready' ? null : isEmpty ? (
          <View style={styles.emptyState}>
            <View style={styles.pillIconFrame}>
              <Image source={pillIcon} style={styles.pillIcon} contentFit="contain" tintColor={colors.textSubtle} />
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
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${formatPrescriptionName(prescription)}`}
                    >
                      {/* One-colour icons, tinted to the theme so they show in dark mode. */}
                      <Image source={editIcon} style={styles.icon} contentFit="contain" tintColor={colors.onSurfaceVariant} />
                    </Pressable>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleDelete(prescription)}
                      disabled={deletingId !== null}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${formatPrescriptionName(prescription)}`}
                    >
                      <Image source={deleteIcon} style={styles.icon} contentFit="contain" tintColor={colors.onSurfaceVariant} />
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
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    ...ContentColumn,
    paddingBottom: Spacing.five,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  // Bounding box of the 42x70 pill once rotated 42.22deg, as laid out in Figma.
  pillIconFrame: {
    width: 78,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  pillIcon: {
    width: 42,
    height: 70,
    transform: [{ rotate: '42.22deg' }],
  },
  emptyText: {
    ...Typography.bodyLarge,
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  addButton: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignSelf: 'center',
  },
  addButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: colors.text,
  },
  listFrame: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    borderRadius: Radius.card,
    padding: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  list: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    minHeight: 56,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  listItemDeleting: {
    opacity: 0.4,
  },
  listItemTextColumn: {
    flex: 1,
  },
  name: {
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: colors.text,
  },
  frequency: {
    ...Typography.caption,
    letterSpacing: 0.4,
    color: colors.text,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  addPrescriptionsButton: {
    marginTop: Spacing.three,
    backgroundColor: colors.primary,
    alignItems: 'center',
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  addPrescriptionsButtonText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.onPrimary,
  },
}));
