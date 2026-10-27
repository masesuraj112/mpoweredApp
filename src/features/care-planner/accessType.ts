// Converts between the two "can add" flags the app shows and the access_type text the database stores.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

export type AccessType = 'none' | 'questions' | 'answers' | 'questions,answers';

export type AccessFlags = {
  canAddQuestions: boolean;
  canAddAnswers: boolean;
};

export function accessTypeToDb({ canAddQuestions, canAddAnswers }: AccessFlags): AccessType {
  if (canAddQuestions && canAddAnswers) return 'questions,answers';
  if (canAddQuestions) return 'questions';
  if (canAddAnswers) return 'answers';
  return 'none';
}

/** An unknown value gives no access, so a bad row can never grant more than it should. */
export function accessTypeFromDb(value: string | null | undefined): AccessFlags {
  switch (value) {
    case 'questions,answers':
      return { canAddQuestions: true, canAddAnswers: true };
    case 'questions':
      return { canAddQuestions: true, canAddAnswers: false };
    case 'answers':
      return { canAddQuestions: false, canAddAnswers: true };
    default:
      return { canAddQuestions: false, canAddAnswers: false };
  }
}
