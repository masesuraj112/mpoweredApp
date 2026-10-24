import { NO_MEDICATION_OPTION } from '@/constants/managementOptions';
import { toggleMedicationOption } from '@/features/assessments/management/medication';

const none = { medications: [], noMedication: false };

describe('toggleMedicationOption', () => {
  it('ticking a medication adds it; ticking it again removes it', () => {
    const ticked = toggleMedicationOption(none, 'Amlodipine 5 mg');
    expect(ticked).toEqual({ medications: ['Amlodipine 5 mg'], noMedication: false });
    expect(toggleMedicationOption(ticked, 'Amlodipine 5 mg')).toEqual(none);
  });

  it('keeps the other ticked medications', () => {
    const current = { medications: ['Amlodipine 5 mg', 'Vitamin D3 1000 IU'], noMedication: false };
    expect(toggleMedicationOption(current, 'Amlodipine 5 mg')).toEqual({
      medications: ['Vitamin D3 1000 IU'],
      noMedication: false,
    });
  });

  it('ticking "I didn\'t take any medication" clears all medications', () => {
    const current = { medications: ['Amlodipine 5 mg', 'Vitamin D3 1000 IU'], noMedication: false };
    expect(toggleMedicationOption(current, NO_MEDICATION_OPTION)).toEqual({ medications: [], noMedication: true });
  });

  it('ticking a medication while "none" is ticked clears "none"', () => {
    expect(toggleMedicationOption({ medications: [], noMedication: true }, 'Amlodipine 5 mg')).toEqual({
      medications: ['Amlodipine 5 mg'],
      noMedication: false,
    });
  });

  it('ticking "none" again unticks it', () => {
    expect(toggleMedicationOption({ medications: [], noMedication: true }, NO_MEDICATION_OPTION)).toEqual(none);
  });
});
