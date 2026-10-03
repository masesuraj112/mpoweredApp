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
    'src/lib/result.ts',
    'src/lib/errors.ts',
    'src/services/assessments.ts',
  ],
};
