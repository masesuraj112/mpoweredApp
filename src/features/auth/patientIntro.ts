// Whether a new account sees the "You're off to an MPowered start" slides. They describe the patient
// questionnaires, so a support person goes straight into their app instead.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export function seesPatientIntro(userType: 'patient' | 'support-person' | null): boolean {
  return userType === 'patient';
}
