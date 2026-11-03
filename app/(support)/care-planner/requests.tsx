import { Alert, Platform, StyleSheet, View } from 'react-native';

import { NotificationBell } from '@/components/support-person/NotificationBell';
import { SupportRequestCard } from '@/components/support-person/SupportRequestCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';
import { useSupportPerson } from '@/features/support-person/context';
import type { SupportRequest } from '@/features/support-person/types';

/** Pending requests from patients to add this user as their support person (Figma 3911-24738). */
export default function SupportRequestsScreen() {
  const { status, reload, requests, acceptRequest, rejectRequest } = useSupportPerson();

  // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
  const showError = (title: string, message: string) => {
    if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  const accept = async (request: SupportRequest) => {
    const error = await acceptRequest(request.id);
    if (error) showError('Could not accept the request', 'Please check your connection and try again.');
  };

  const reject = async (request: SupportRequest) => {
    const error = await rejectRequest(request.id);
    if (error) showError('Could not reject the request', 'Please check your connection and try again.');
  };

  // Rejecting can't be undone (the patient would have to send a new request), so confirm first.
  const confirmReject = (request: SupportRequest) => {
    const message = `${request.patient.name} won't be able to share their appointments with you unless they send a new request.`;

    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
    if (Platform.OS === 'web') {
      if (window.confirm(message)) reject(request);
      return;
    }

    Alert.alert(`Reject ${request.patient.name}'s request?`, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => reject(request) },
    ]);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText accessibilityRole="header" variant="headlineSmall" style={styles.title}>
            Support person requests
          </AppText>
          {/* Already on the requests screen, so the bell only shows the count here. */}
          <NotificationBell count={requests.length} />
        </View>

        {status === 'loading' ? (
          <LoadingState label="Loading support person requests" />
        ) : status === 'error' ? (
          <ErrorState message="We could not load your support person requests." onRetry={reload} />
        ) : requests.length === 0 ? (
          // Not in the designs: wording to confirm with the designer.
          <AppText variant="bodyMediumRegular" color="onSurfaceVariant">
            You don’t have any support person requests right now.
          </AppText>
        ) : (
          requests.map((request) => (
            <SupportRequestCard
              key={request.id}
              patientName={request.patient.name}
              onAccept={() => accept(request)}
              onReject={() => confirmReject(request)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
  },
});
