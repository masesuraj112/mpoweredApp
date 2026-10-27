import { render, screen } from '@testing-library/react-native';
import PainCharacteristicsScreen from '../app/(tabs)/tracker/pain/characteristics';
import PainLocationScreen from '../app/(tabs)/tracker/pain/location';
import { PainAssessmentProvider } from '@/features/assessments/pain/context';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() } }));

// A bare string inside a View throws on native, which crashed these screens back to Home.
describe.each([
  ['Pain location', PainLocationScreen, /Select ALL relevant statements/],
  ['Pain characteristics', PainCharacteristicsScreen, /scroll down for more options/],
])('%s', (_name, Screen, subPromptText) => {
  it('renders its sub-prompt without crashing', async () => {
    await render(
      <PainAssessmentProvider>
        <Screen />
      </PainAssessmentProvider>,
    );
    expect(screen.getByText(subPromptText)).toBeTruthy();
  });
});
