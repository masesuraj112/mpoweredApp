import { render, screen } from '@testing-library/react-native';
import type { ComponentType, ReactNode } from 'react';

import ManagementFirst from '../app/(tabs)/(home)/tracker/management/medication';
import MovementFirst from '../app/(tabs)/(home)/tracker/movement/activity';
import PainSecond from '../app/(tabs)/(home)/tracker/pain/characteristics';
import PainFirst from '../app/(tabs)/(home)/tracker/pain/location';
import PersonalCareFirst from '../app/(tabs)/(home)/tracker/personal-care/general';
import SocialHealthFirst from '../app/(tabs)/(home)/tracker/social-health/social-life';
import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { MovementAssessmentProvider } from '@/features/assessments/movement/context';
import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { PersonalCareAssessmentProvider } from '@/features/assessments/personal-care/context';
import { SocialHealthAssessmentProvider } from '@/features/assessments/social-health/context';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useNavigation: () => ({ getState: () => undefined, getParent: () => undefined, setOptions: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

// The header's back button leaves a questionnaire; Prev only steps between its questions, so the first
// question has nothing before it.
describe.each<[string, ComponentType, ComponentType<{ children: ReactNode }>]>([
  ['Pain', PainFirst, PainAssessmentProvider],
  ['Movement', MovementFirst, MovementAssessmentProvider],
  ['Personal care', PersonalCareFirst, PersonalCareAssessmentProvider],
  ['Social health', SocialHealthFirst, SocialHealthAssessmentProvider],
  ['Management', ManagementFirst, ManagementAssessmentProvider],
])('%s questionnaire', (_, FirstQuestion, Provider) => {
  it('has no Prev button on its first question', async () => {
    await render(
      <Provider>
        <FirstQuestion />
      </Provider>,
    );
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
  });
});

// So the check above can't pass just because the button is named differently.
it('shows Prev from the second question on', async () => {
  await render(
    <PainAssessmentProvider>
      <PainSecond />
    </PainAssessmentProvider>,
  );
  expect(screen.getByRole('button', { name: 'Previous' })).toBeTruthy();
});
