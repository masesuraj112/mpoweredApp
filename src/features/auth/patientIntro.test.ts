import { seesPatientIntro } from './patientIntro';

describe('seesPatientIntro', () => {
  it('shows the slides to a new patient', () => {
    expect(seesPatientIntro('patient')).toBe(true);
  });

  it('skips them for a new support person', () => {
    expect(seesPatientIntro('support-person')).toBe(false);
  });

  it('skips them when the type is unknown', () => {
    expect(seesPatientIntro(null)).toBe(false);
  });
});
