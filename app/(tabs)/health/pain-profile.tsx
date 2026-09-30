import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface ProfileItem {
  label: string;
  value: string;
}

interface ProfileSection {
  id: string;
  title: string;
  subtitle?: string;
  /** Compact sections show short, bold answers (e.g. pain scores) */
  variant: 'summary' | 'compact' | 'detail';
  items: ProfileItem[];
}

// TODO: replace with the user's generated pain profile from Supabase once it is wired up
const LAST_UPDATED = '24 May 2026';

const FAKE_PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'about',
    title: 'About me',
    variant: 'summary',
    items: [
      { label: 'Name', value: 'Jane' },
      { label: 'Sex', value: 'Female' },
      { label: 'Age group', value: 'Older Adult (65 years and over)' },
    ],
  },
  {
    id: 'conditions',
    title: 'My conditions',
    variant: 'summary',
    items: [
      { label: 'Primary condition', value: 'Osteoarthritis' },
      { label: 'Other conditions', value: 'Hypertension' },
    ],
  },
  {
    id: 'pain',
    title: 'My Pain',
    subtitle: 'Severity of my pain, pattern, and location',
    variant: 'compact',
    items: [
      { label: 'My Pain location', value: 'Lower back, knee' },
      { label: 'My Current pain: 0', value: 'I do not have pain at the moment.' },
      { label: 'Average pain (2 weeks): 7', value: 'I have had significant pain most days.' },
      { label: 'Worst pain: 9', value: 'My worst pain was very severe.' },
      { label: 'Mildest pain: 2', value: 'I have experienced mild pain.' },
      { label: 'Pain characteristics', value: 'My pain were: aching, throbbing' },
    ],
  },
  {
    id: 'movement',
    title: 'Impacts to Movement',
    variant: 'detail',
    items: [
      {
        label: 'Average activity hour:',
        value: 'Last week, I was able to stay active for approximately 6 hours',
      },
      {
        label: 'General Movement:',
        value: 'I walk more slowly than usual and I lie down to rest more often.',
      },
      { label: 'Walking:', value: 'Pain prevents me from walking more than 500 metres.' },
      {
        label: 'Lifting:',
        value: 'I struggle to lift heavy weights off the floor, but I can lift medium weights on the table',
      },
      { label: 'Sitting:', value: 'Pain prevents me sitting more than 30 minutes.' },
      { label: 'Standing:', value: 'Pain prevents me standing more than 30 minutes' },
    ],
  },
  {
    id: 'personal-care',
    title: 'Impacts to Personal Care',
    variant: 'detail',
    items: [
      {
        label: 'General Activities:',
        value:
          'I am not doing any jobs that I usually do around the house, I get dressed more slowly than usual, and I sleep less well because of pain.',
      },
      {
        label: 'Personal care (washing, dressing, etc)',
        value: 'I need some help but manage most of my personal care.',
      },
      { label: 'Sleeping:', value: 'Because of pain I have less than 4 hours of sleep.' },
    ],
  },
  {
    id: 'social-health',
    title: 'Impacts to Social Health',
    variant: 'detail',
    items: [
      { label: 'Social life:', value: 'Pain has restricted my social life and I do not go out as often.' },
      { label: 'Travelling:', value: 'Pain restricts me to journeys of less than one hour.' },
      { label: 'Mood:', value: 'Pain affects my mood a lot.' },
      { label: 'Relation with others', value: 'Pain significantly interferes with my relationships.' },
      { label: 'Enjoyment of life', value: 'Pain significantly impacts my ability to enjoy life.' },
    ],
  },
  {
    id: 'management',
    title: 'My Current Management',
    variant: 'detail',
    items: [
      { label: 'Medication:', value: 'You only consumed vitamin D3 1000 IU this week.' },
      { label: 'Exercise:', value: 'You exercised for 3-4 days this week.' },
      { label: 'Emotion:', value: 'You did not perform any dedicated strategy to manage your mood.' },
    ],
  },
];

export default function PainProfileScreen() {
  const actionChips = (
    <View style={styles.chipRow}>
      {/* TODO: wire up PDF export and sharing */}
      <Pressable style={styles.chip} accessibilityRole="button">
        <Text style={styles.chipText}>Print PDF</Text>
      </Pressable>
      <Pressable style={styles.chip} accessibilityRole="button">
        <Text style={styles.chipText}>Share</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader
          title="My Pain Profiles"
          topBarLabel="Homescreen"
          titleAccessory={actionChips}
        />
        <Text style={styles.updatedText}>Updated by {LAST_UPDATED}</Text>
        <View style={styles.headerDivider} />

        {FAKE_PROFILE_SECTIONS.map((section) => (
          <View key={section.id} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            {section.subtitle && <Text style={styles.cardSubtitle}>{section.subtitle}</Text>}
            <View style={styles.cardDivider} />

            {section.items.map((item) => (
              <View
                key={item.label}
                style={[styles.item, section.variant === 'detail' && styles.itemDetail]}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.itemValue,
                    section.variant === 'compact' && styles.itemValueCompact,
                    section.variant === 'detail' && styles.itemValueDetail,
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const GROUPED_TERTIARY = '#F2F2F7';
const OUTLINE_VARIANT = '#CAC4D0';
const ON_SURFACE = '#1D1B20';
const ON_SURFACE_VARIANT = '#49454F';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  chipRow: {
    flexDirection: 'row',
    gap: scaleWidth(3),
  },
  chip: {
    height: scaleHeight(32),
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(8),
    borderWidth: 1,
    borderColor: OUTLINE_VARIANT,
    borderRadius: scaleWidth(8),
  },
  chipText: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.5,
    color: ON_SURFACE,
  },
  updatedText: {
    fontSize: scaleFont(12),
    color: '#79747E',
    marginTop: scaleHeight(2),
    marginHorizontal: scaleWidth(38),
  },
  headerDivider: {
    height: 1,
    backgroundColor: OUTLINE_VARIANT,
    marginHorizontal: scaleWidth(16),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(26),
  },
  card: {
    backgroundColor: GROUPED_TERTIARY,
    borderRadius: scaleWidth(12),
    marginHorizontal: scaleWidth(32),
    marginBottom: scaleHeight(25),
    paddingTop: scaleHeight(20),
    paddingBottom: scaleHeight(12),
  },
  cardTitle: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: 'black',
    marginHorizontal: scaleWidth(26),
  },
  cardSubtitle: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    letterSpacing: 0.4,
    color: ON_SURFACE,
    marginHorizontal: scaleWidth(26),
    marginTop: scaleHeight(4),
  },
  cardDivider: {
    height: 1,
    backgroundColor: OUTLINE_VARIANT,
    marginHorizontal: scaleWidth(26),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(6),
  },
  item: {
    paddingHorizontal: scaleWidth(30),
    paddingVertical: scaleHeight(8),
  },
  itemDetail: {
    paddingVertical: scaleHeight(10),
  },
  itemLabel: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '500',
    letterSpacing: 0.5,
    color: ON_SURFACE_VARIANT,
  },
  itemValue: {
    fontSize: scaleFont(16),
    lineHeight: scaleFont(24),
    letterSpacing: 0.5,
    color: ON_SURFACE,
  },
  itemValueCompact: {
    fontSize: scaleFont(12),
    lineHeight: scaleFont(16),
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  itemValueDetail: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    letterSpacing: 0.25,
  },
});
