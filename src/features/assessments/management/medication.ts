// The selection rule for the medication list: "I didn't take any medication" and the
// medications exclude each other (M8).
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { NO_MEDICATION_OPTION } from '@/constants/managementOptions';

export type MedicationSelection = { medications: string[]; noMedication: boolean };

/** The selection after the user taps `option`. Tapping a ticked item unticks it. */
export function toggleMedicationOption(current: MedicationSelection, option: string): MedicationSelection {
  if (option === NO_MEDICATION_OPTION) {
    return { medications: [], noMedication: !current.noMedication };
  }
  const medications = current.medications.includes(option)
    ? current.medications.filter((name) => name !== option)
    : [...current.medications, option];
  return { medications, noMedication: false };
}
