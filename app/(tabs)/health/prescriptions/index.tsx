import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { HealthSubpage } from '@/components/health/HealthSubpage';
import { PrescriptionsHeader } from '@/components/health/PrescriptionsHeader';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconButton } from '@/components/ui/IconButton';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { healthLoadMessage } from '@/features/health-profile/messages';
import {
  formatFrequency,
  formatPrescriptionName,
  prescriptionErrorMessage,
  type Prescription,
} from '@/features/health-profile/prescriptions';
import { useFocusedQuery } from '@/hooks/useFocusedQuery';
import { deletePrescription, getPrescriptions } from '@/services/health';

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
    <HealthSubpage header={<PrescriptionsHeader title="My Prescriptions" />}>
      {state.status === 'loading' && <LoadingState label="Loading your prescriptions" />}
      {state.status === 'error' && (
        <ErrorState message={healthLoadMessage(state.error)} onRetry={reload} />
      )}

      {state.status !== 'ready' ? null : isEmpty ? (
        <View style={styles.emptyState}>
          <View style={styles.pillIconFrame}>
            <Image source={pillIcon} style={styles.pillIcon} contentFit="contain" />
          </View>
          <AppText variant="bodyLarge" color="textSecondary" style={styles.emptyText}>
            Prescriptions list is empty
          </AppText>
          <Button
            label="Add prescription"
            variant="tonal"
            onPress={() => router.push('/health/prescriptions/add')}
          />
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
                    <AppText variant="bodyMedium" color="onSurface">
                      {formatPrescriptionName(prescription)}
                    </AppText>
                    <AppText variant="bodySmall" color="onSurface">
                      {formatFrequency(prescription)}
                    </AppText>
                  </View>
                  <IconButton
                    icon={editIcon}
                    iconSize={ICON_SIZE}
                    accessibilityLabel={`Edit ${formatPrescriptionName(prescription)}`}
                    onPress={() => handleEdit(prescription)}
                  />
                  <IconButton
                    icon={deleteIcon}
                    iconSize={ICON_SIZE}
                    accessibilityLabel={`Delete ${formatPrescriptionName(prescription)}`}
                    disabled={deletingId !== null}
                    onPress={() => handleDelete(prescription)}
                  />
                </View>
              ))}
            </View>
          </View>

          <Button
            label="Add prescriptions"
            variant="primary"
            onPress={() => router.push('/health/prescriptions/add')}
          />
        </>
      )}
    </HealthSubpage>
  );
}

const ICON_SIZE = 24;
// Bounding box of the 42x70 pill once rotated 42.22deg, as laid out in Figma.
const PILL_FRAME_WIDTH = 78;
const PILL_FRAME_HEIGHT = 80;

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    marginTop: Spacing.six,
    gap: Spacing.three,
  },
  pillIconFrame: {
    width: PILL_FRAME_WIDTH,
    height: PILL_FRAME_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillIcon: {
    width: 42,
    height: 70,
    transform: [{ rotate: '42.22deg' }],
  },
  emptyText: {
    textAlign: 'center',
  },
  listFrame: {
    marginBottom: Spacing.three,
    padding: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
  },
  list: {
    overflow: 'hidden',
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget + Spacing.two,
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  listItemDeleting: {
    opacity: 0.4,
  },
  listItemTextColumn: {
    flex: 1,
  },
});
