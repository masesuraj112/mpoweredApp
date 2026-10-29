import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCompletedAssessments,
  getWeeklyReflection,
  markAssessmentCompleted,
  saveWeeklyReflection,
} from './homeProgress';
import { getLocalToday, getWeekStart } from './week';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const storage = jest.mocked(AsyncStorage);
const weekStart = getWeekStart(getLocalToday());
const assessmentsKey = `@mpowered/weekly-assessments/v2/${weekStart}`;
const reflectionKey = `@mpowered/weekly-reflection/v1/${weekStart}`;

describe('weekly home progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getItem.mockResolvedValue(null);
    storage.setItem.mockResolvedValue(undefined);
  });

  it('does not read legacy assessment records that counted opening as completion', async () => {
    await expect(getCompletedAssessments()).resolves.toEqual(new Set());
    expect(storage.getItem).toHaveBeenCalledWith(assessmentsKey);
    expect(assessmentsKey).toContain('/v2/');
  });

  it('adds a completed assessment without removing earlier completions', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(['pain']));

    await markAssessmentCompleted('movement');

    expect(storage.setItem).toHaveBeenCalledWith(
      assessmentsKey,
      JSON.stringify(['pain', 'movement']),
    );
  });

  it('rejects malformed stored assessment progress', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify(['unknown']));

    await expect(getCompletedAssessments()).rejects.toThrow(
      'Stored weekly assessment progress has an invalid format.',
    );
  });

  it('saves and reads a trimmed reflection for the current week', async () => {
    await saveWeeklyReflection('  I felt more active this week.  ');
    expect(storage.setItem).toHaveBeenCalledWith(
      reflectionKey,
      'I felt more active this week.',
    );

    storage.getItem.mockResolvedValue('I felt more active this week.');
    await expect(getWeeklyReflection()).resolves.toBe('I felt more active this week.');
    expect(storage.getItem).toHaveBeenCalledWith(reflectionKey);
  });
});
