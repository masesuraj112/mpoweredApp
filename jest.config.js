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
    'src/lib/result.ts',
    'src/lib/errors.ts',
    'src/services/assessments.ts',
    'src/features/health-profile/prescriptions.ts',
    'src/features/health-profile/profile.ts',
    'src/features/health-profile/tracking.ts',
    'src/features/health-profile/pdf-export.ts',
    'src/services/health.ts',
  ],
};
