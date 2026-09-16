import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '@/services/scale';

// Fake data for now — replace with real assessment state once the shape is confirmed
const fakeSummary = {
  period: '18-24 May',
  locations: ['Lower back', 'Other: Knee'],
  characteristics: ['aching', 'throbbing'],
  intensity: {
    current: { value: 0, description: 'I do not experience pain at the moment.' },
    mildest: { value: 2, description: 'I have experienced mild pain.' },
    worst: { value: 9, description: 'My worst pain was very severe.' },
    average: { value: 7, description: 'I have experienced severe pain.' },
  },
};

export function PainSummary() {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>My Pain Summary</Text>
      <Text style={styles.subheading}>
        This helps guide your treatment and support your recovery.
      </Text>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>My Pain</Text>
          <Text style={styles.periodText}>Period: {fakeSummary.period}</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Pain location</Text>
        <Text style={styles.bodyText}>I have pain in the following areas:</Text>
        {fakeSummary.locations.map((loc) => (
          <Text key={loc} style={styles.bulletText}>• {loc}</Text>
        ))}

        <Text style={styles.sectionTitle}>Pain characteristics</Text>
        <Text style={styles.bodyText}>
          My pain were: <Text style={styles.boldInline}>{fakeSummary.characteristics.join(', ')}</Text>
        </Text>

        <Text style={styles.sectionTitle}>Pain intensity</Text>

        <IntensityRow label="Current Pain" value={fakeSummary.intensity.current.value} description={fakeSummary.intensity.current.description} />
        <IntensityRow label="Mildest pain" value={fakeSummary.intensity.mildest.value} description={fakeSummary.intensity.mildest.description} />
        <IntensityRow label="Worst pain" value={fakeSummary.intensity.worst.value} description={fakeSummary.intensity.worst.description} />
        <IntensityRow label="Average pain" value={fakeSummary.intensity.average.value} description={fakeSummary.intensity.average.description} />

        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <Text style={styles.savedText}>Saved to My Health</Text>
          <TouchableOpacity style={styles.closeButton}>
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
    borderColor: '#D0D0D0',
    borderRadius: scaleWidth(15),
    padding: scaleWidth(28),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
  },
  periodText: {
    fontSize: scaleFont(13),
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#D0D0D0',
    marginVertical: scaleHeight(22),
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
    borderColor: '#333',
    borderRadius: scaleWidth(20),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(8),
  },
  closeButtonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
  },
});