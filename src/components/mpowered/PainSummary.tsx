import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export function PainSummary({ summary, onClose }: PainSummaryProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>My Pain</Text>
          <Text style={styles.periodText}>Period: {summary.period}</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Pain location</Text>
        <Text style={styles.bodyText}>I have pain in the following areas:</Text>
        {summary.locations.map((loc) => (
          <Text key={loc} style={styles.bulletText}>• {loc}</Text>
        ))}

        <Text style={styles.sectionTitle}>Pain characteristics</Text>
        <Text style={styles.bodyText}>
          My pain were: <Text style={styles.boldInline}>{summary.characteristics.join(', ')}</Text>
        </Text>

        <Text style={styles.sectionTitle}>Pain intensity</Text>

        <IntensityRow label="Current Pain" value={summary.intensity.current.value} description={summary.intensity.current.description} />
        <IntensityRow label="Mildest pain" value={summary.intensity.mildest.value} description={summary.intensity.mildest.description} />
        <IntensityRow label="Worst pain" value={summary.intensity.worst.value} description={summary.intensity.worst.description} />
        <IntensityRow label="Average pain" value={summary.intensity.average.value} description={summary.intensity.average.description} />

        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <Text style={styles.savedText}>Saved to My Health</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
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
    padding: scaleWidth(20),
  },
  heading: {
    fontSize: scaleFont(26),
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
  },
  subheading: {
    fontSize: scaleFont(15),
    color: '#333',
    marginBottom: scaleHeight(28),
  },
  card: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: scaleWidth(20),
    paddingTop: scaleHeight(24),
    paddingHorizontal: scaleWidth(20),
    paddingBottom: scaleHeight(20),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: scaleFont(28),
    fontWeight: '500',
  },
  periodText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: 'black',
    marginBottom: scaleHeight(20),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    marginTop: scaleHeight(26),
    marginBottom: scaleHeight(14),
  },
  bodyText: {
    fontSize: scaleFont(14),
    color: '#333',
    lineHeight: scaleFont(20),
  },
  bulletText: {
    fontSize: scaleFont(14),
    fontWeight: 'bold',
    marginLeft: scaleWidth(10),
    marginTop: scaleHeight(8),
  },
  boldInline: {
    fontWeight: 'bold',
  },
  intensityRow: {
    marginTop: scaleHeight(20),
  },
  intensityLabel: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    color: '#555',
    marginBottom: scaleHeight(6),
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D0D0D0',
    marginTop: scaleHeight(30),
    marginBottom: scaleHeight(20),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedText: {
    color: '#888',
    fontSize: scaleFont(14),
  },
  closeButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: scaleWidth(24),
    paddingHorizontal: scaleWidth(22),
    paddingVertical: scaleHeight(10),
  },
  closeButtonText: {
    fontSize: scaleFont(18),
    fontWeight: '400',
  },
});