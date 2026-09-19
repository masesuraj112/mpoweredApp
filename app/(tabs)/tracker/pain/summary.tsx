import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '@/services/scale';

interface PainIntensityEntry {
  value: number;
  description: string;
}

interface PainSummaryData {
  period: string;
  locations: string[];
  characteristics: string[];
  intensity: {
    current: PainIntensityEntry;
    mildest: PainIntensityEntry;
    worst: PainIntensityEntry;
    average: PainIntensityEntry;
  };
}

interface PainSummaryProps {
  summary: PainSummaryData;
  onClose?: () => void;
}

// Put fake data temporarily to test if flow is working
const MOCK_SUMMARY: PainSummaryData = {
  period: 'Last 7 days',
  locations: ['Lower back', 'Left shoulder'],
  characteristics: ['Sharp', 'Aching', 'Intermittent'],
  intensity: {
    current: { value: 3, description: 'Mild, manageable' },
    mildest: { value: 1, description: 'Barely noticeable' },
    worst: { value: 7, description: 'Severe, hard to move' },
    average: { value: 4, description: 'Moderate' },
  },
};

export default function PainSummary({ summary = MOCK_SUMMARY, onClose }: PainSummaryProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.card}>
        <ScrollView
          contentContainerStyle={styles.cardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>My Pain</Text>
              <Text style={styles.periodText}>Period: {summary.period}</Text>
            </View>
            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Pain location</Text>
            <Text style={styles.bodyText}>I have pain in the following areas:</Text>
            <View style={styles.bulletRow}>
              {summary.locations.map((loc) => (
                <Text key={loc} style={styles.bulletText}>• {loc}</Text>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Pain characteristics</Text>
            <Text style={styles.bodyText}>
              My pain were: <Text style={styles.boldInline}>{summary.characteristics.join(', ')}</Text>
            </Text>

            <Text style={styles.sectionTitle}>Pain intensity</Text>
            <View style={styles.intensityGrid}>
              <IntensityRow label="Current Pain" value={summary.intensity.current.value} description={summary.intensity.current.description} />
              <IntensityRow label="Mildest pain" value={summary.intensity.mildest.value} description={summary.intensity.mildest.description} />
              <IntensityRow label="Worst pain" value={summary.intensity.worst.value} description={summary.intensity.worst.description} />
              <IntensityRow label="Average pain" value={summary.intensity.average.value} description={summary.intensity.average.description} />
            </View>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.footerDivider} />
            <View style={styles.footerRow}>
              <Text style={styles.savedText}>Saved to My Health</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function IntensityRow({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <View style={styles.intensityRow}>
      <Text style={styles.intensityLabel}>{label}: {value}</Text>
      <Text style={styles.bodyText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: scaleWidth(20),
  },
  heading: {
    fontSize: scaleFont(24),
    fontWeight: 'bold',
    marginBottom: scaleHeight(6),
  },
  subheading: {
    fontSize: scaleFont(14),
    color: '#333',
    marginBottom: scaleHeight(18),
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(22),
    paddingTop: scaleHeight(20),
    paddingBottom: scaleHeight(20),
    overflow: 'hidden',
  },
  cardScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: scaleFont(26),
    fontWeight: '500',
  },
  periodText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'black',
    marginBottom: scaleHeight(16),
  },
  sectionTitle: {
    fontSize: scaleFont(18),
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(8),
  },
  bodyText: {
    fontSize: scaleFont(13),
    color: '#333',
    lineHeight: scaleFont(18),
  },
  bulletRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(16),
    marginTop: scaleHeight(6),
  },
  bulletText: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    marginTop: scaleHeight(4),
  },
  boldInline: {
    fontWeight: 'bold',
  },
  intensityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: scaleHeight(8),
  },
  intensityRow: {
    width: '48%',
    marginTop: scaleHeight(14),
  },
  intensityLabel: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#555',
    marginBottom: scaleHeight(4),
  },
  footerContainer: {
    marginTop: scaleHeight(16),
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D0D0D0',
    marginBottom: scaleHeight(16),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedText: {
    color: '#888',
    fontSize: scaleFont(13),
  },
  closeButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: scaleWidth(24),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(9),
  },
  closeButtonText: {
    fontSize: scaleFont(16),
    fontWeight: '400',
  },
});