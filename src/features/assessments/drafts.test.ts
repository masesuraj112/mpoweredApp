import AsyncStorage from '@react-native-async-storage/async-storage';
import { readFileSync } from 'fs';
import { join } from 'path';

import { ASSESSMENT_DRAFT_PREFIX, clearAssessmentDrafts } from './drafts';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('clearAssessmentDrafts', () => {
  it('removes every assessment draft and leaves other stored values alone', async () => {
    await AsyncStorage.setItem(`${ASSESSMENT_DRAFT_PREFIX}v1/pain`, '{"intensity":3}');
    await AsyncStorage.setItem(`${ASSESSMENT_DRAFT_PREFIX}v1/social-health`, '{"mood":"low"}');
    await AsyncStorage.setItem('some-other-key', 'keep me');

    await clearAssessmentDrafts();

    expect(await AsyncStorage.getAllKeys()).toEqual(['some-other-key']);
  });

  it('does nothing when there are no drafts', async () => {
    await AsyncStorage.setItem('some-other-key', 'keep me');

    await clearAssessmentDrafts();

    expect(await AsyncStorage.getItem('some-other-key')).toBe('keep me');
  });

  it('matches the keys the five assessment contexts really use', () => {
    // Guards against a context being given a key outside the prefix, which would escape the clear.
    const contexts = ['management', 'movement', 'pain', 'personal-care', 'social-health'].map(name =>
      readFileSync(join(__dirname, name, 'context.ts'), 'utf8'),
    );
    for (const source of contexts) {
      expect(source).toContain(`'${ASSESSMENT_DRAFT_PREFIX}`);
    }
  });
});
