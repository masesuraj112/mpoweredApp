module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/assets/(.*)$': '<rootDir>/assets/$1', // must come first: same alias prefix as the next line
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/features/assessments/week.ts',
    'src/features/assessments/pain/normalise.ts',
    'src/features/assessments/pain/validate.ts',
    'src/features/assessments/pain/messages.ts',
    'src/features/assessments/pain/summary.ts',
    'src/features/assessments/social-health/mood.ts',
    'src/features/assessments/social-health/validate.ts',
    'src/features/assessments/social-health/scoring.ts',
    'src/features/assessments/social-health/messages.ts',
    'src/lib/result.ts',
    'src/lib/errors.ts',
    'src/services/assessments.ts',
    'src/services/social-health.ts',
  ],
};
