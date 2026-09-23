import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PainTrendChart, type PainTrendPoint } from '@/components/mpowered/PainTrendChart';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

const painProfileIcon = require('../../../assets/images/health/pain-profile-icon.png');

// TODO: replace with a Supabase query once tracking data is wired up, e.g.
// supabase.from('pain_assessment').select('date, average_pain_level').eq('users_id', userId).order('date')
const FAKE_PAIN_TREND: PainTrendPoint[] = [
  { label: '25/05', value: 5 },
  { label: '01/06', value: 5 },
  { label: '08/06', value: 7 },
];

export default function HealthScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>My Health</Text>
        <View style={styles.divider} />

        <Pressable
          style={styles.profileCard}
          onPress={() => router.push('/health/pain-profile')}
        >
          <Text style={styles.profileTitle}>Your Mpowered Health Profile has been created</Text>
          <Text style={styles.profileUpdated}>Updated by 18 Feb 2026</Text>

          <View style={styles.profileRow}>
            <Image source={painProfileIcon} style={styles.profileIcon} contentFit="contain" />
            <Text style={styles.profileDescription}>
              This pain profile will be generated each time you complete the impact questions :)
            </Text>
          </View>

          <View style={styles.openProfileButtonRow}>
            <View style={styles.openProfileButton}>
              <Text style={styles.openProfileButtonText}>Open my pain profile</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.shortcutRow}>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/health/tracking/chart')}
          >
            <Text style={styles.shortcutText}>Check my health tracking records</Text>
          </Pressable>
          <Pressable
            style={styles.shortcutCard}
            onPress={() => router.push('/health/prescriptions')}
          >
            <Text style={styles.shortcutText}>Check my prescriptions</Text>
          </Pressable>
        </View>

        <View style={styles.trendSection}>
          <View style={styles.trendInsightRow}>
            <Text style={styles.trendInsight}>New insights for your m</Text>
            <Text style={[styles.trendInsight, styles.trendInsightSuperscript]}>powered</Text>
            <Text style={styles.trendInsight}> plan.</Text>
          </View>
          <Text style={styles.trendSubtitle}>Your average pain increased</Text>

          <View style={styles.trendChart}>
            <PainTrendChart data={FAKE_PAIN_TREND} height={styles.trendChart.height} />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, styles.actionButtonLeft]}
              onPress={() => router.push('/health/tracking/history')}
            >
              <Text style={styles.actionButtonText}>Pain History</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/planner')}
            >
              <Text style={styles.actionButtonText}>Plan Appointment</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.actionButtonRight]}
              onPress={() => router.push('/health/pain-guide')}
            >
              <Text style={styles.actionButtonText}>Pain Guide</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GROUPED_BACKGROUND = '#F2F2F7';
const PRIMARY_PURPLE = '#6750A4';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: 'black',
    marginTop: scaleHeight(24),
    marginHorizontal: scaleWidth(24),
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#CAC4D0',
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(20),
  },
  profileCard: {
    backgroundColor: GROUPED_BACKGROUND,
    borderRadius: scaleWidth(12),
    marginHorizontal: scaleWidth(24),
    padding: scaleWidth(16),
  },
  profileTitle: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: 'black',
  },
  profileUpdated: {
    fontSize: scaleFont(11),
    fontWeight: '500',
    color: 'rgba(60,60,67,0.6)',
    marginTop: scaleHeight(6),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleHeight(16),
    gap: scaleWidth(12),
  },
  profileIcon: {
    width: scaleWidth(37),
    height: scaleHeight(41),
  },
  profileDescription: {
    flex: 1,
    fontSize: scaleFont(12),
    color: '#1D1B20',
  },
  openProfileButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: scaleHeight(16),
  },
  openProfileButton: {
    backgroundColor: 'white',
    borderRadius: scaleWidth(24),
    paddingVertical: scaleHeight(10),
    paddingHorizontal: scaleWidth(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  openProfileButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: 'black',
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: scaleWidth(8),
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(16),
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: GROUPED_BACKGROUND,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(61),
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(15),
    paddingVertical: scaleHeight(10),
  },
  shortcutText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1D1B20',
    textAlign: 'center',
  },
  trendSection: {
    backgroundColor: GROUPED_BACKGROUND,
    marginTop: scaleHeight(24),
    paddingHorizontal: scaleWidth(29),
    paddingTop: scaleHeight(24),
    paddingBottom: scaleHeight(24),
  },
  trendInsight: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    fontStyle: 'italic',
    color: 'black',
  },
  trendInsightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  trendInsightSuperscript: {
    fontSize: scaleFont(10),
    lineHeight: scaleFont(12),
  },
  trendSubtitle: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#1A1A1A',
    marginTop: scaleHeight(12),
  },
  trendChart: {
    width: '100%',
    height: scaleHeight(101),
    marginTop: scaleHeight(12),
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: scaleHeight(16),
  },
  actionButton: {
    flex: 1,
    backgroundColor: PRIMARY_PURPLE,
    borderColor: '#D9D9D9',
    borderWidth: 0.5,
    paddingVertical: scaleHeight(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLeft: {
    borderTopLeftRadius: scaleWidth(10),
    borderBottomLeftRadius: scaleWidth(10),
  },
  actionButtonRight: {
    borderTopRightRadius: scaleWidth(10),
    borderBottomRightRadius: scaleWidth(10),
  },
  actionButtonText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
});
