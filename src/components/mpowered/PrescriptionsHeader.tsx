import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface PrescriptionsHeaderProps {
  title: string;
}

const SECONDARY_CONTAINER = '#E8DEF8';
const ON_SURFACE_VARIANT = '#49454F';

export function PrescriptionsHeader({ title }: PrescriptionsHeaderProps) {
  return (
    <View>
      <View style={styles.topBar}>
        <Pressable style={styles.backRow} hitSlop={8} onPress={() => router.back()}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: SECONDARY_CONTAINER,
    paddingHorizontal: scaleWidth(19),
    paddingTop: scaleHeight(10),
    paddingBottom: scaleHeight(14),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backChevron: {
    fontSize: scaleFont(22),
    color: ON_SURFACE_VARIANT,
    marginRight: scaleWidth(2),
    marginTop: -2,
  },
  backText: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: ON_SURFACE_VARIANT,
  },
  title: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: 'black',
    marginTop: scaleHeight(20),
    marginHorizontal: scaleWidth(24),
  },
});
