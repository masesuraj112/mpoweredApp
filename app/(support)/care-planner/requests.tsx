import { NotificationBell } from '@/components/mpowered/support-person/NotificationBell';
import { SupportRequestCard } from '@/components/mpowered/support-person/SupportRequestCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors } from '@/constants/theme';
import { useSupportPerson } from '@/features/support-person/context';
import type { SupportRequest } from '@/features/support-person/types';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Pending requests from patients to add this user as their support person (Figma 3911-24738). */
export default function SupportRequestsScreen() {
  const { status, reload, requests, acceptRequest, rejectRequest } = useSupportPerson();

  // Rejecting can't be undone (the patient would have to send a new request), so confirm first.
  const confirmReject = (request: SupportRequest) => {
    const message = `${request.patient.name} won't be able to share their appointments with you unless they send a new request.`;

    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
    if (Platform.OS === 'web') {
      if (window.confirm(message)) rejectRequest(request.id);
      return;
    }

    Alert.alert(`Reject ${request.patient.name}'s request?`, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => rejectRequest(request.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            Support person requests
          </Text>
          {/* Already on the requests screen, so the bell only shows the count here. */}
          <NotificationBell count={requests.length} />
        </View>

        {status === 'loading' ? (
          <LoadingState label="Loading support person requests" />
        ) : status === 'error' ? (
          <ErrorState message="We could not load your support person requests." onRetry={reload} />
        ) : requests.length === 0 ? (
          // Not in the designs: wording to confirm with the designer.
          <Text style={styles.empty}>You don’t have any support person requests right now.</Text>
        ) : (
          requests.map(request => (
            <SupportRequestCard
              key={request.id}
              patientName={request.patient.name}
              onAccept={() => acceptRequest(request.id)}
              onReject={() => confirmReject(request)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    gap: scaleHeight(15),
    paddingTop: scaleHeight(20),
    paddingBottom: scaleHeight(32),
    paddingHorizontal: scaleWidth(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: scaleWidth(6),
    marginBottom: scaleHeight(9),
  },
  title: {
    flex: 1,
    color: Colors.light.text,
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleFont(29),
    letterSpacing: -0.48,
  },
  empty: {
    color: Colors.light.onSurfaceVariant,
    fontSize: scaleFont(14),
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
