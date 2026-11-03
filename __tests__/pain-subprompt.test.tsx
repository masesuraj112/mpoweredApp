import { render, screen } from '@testing-library/react-native';
import PainCharacteristicsScreen from '../app/(tabs)/(home)/tracker/pain/characteristics';
import PainLocationScreen from '../app/(tabs)/(home)/tracker/pain/location';
import { PainAssessmentProvider } from '@/features/assessments/pain/context';

// The screens set their header title through the navigation hooks; outside a navigator there is none.
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), dismissTo: jest.fn() },
  useNavigation: () => ({ getState: () => undefined, getParent: () => undefined, setOptions: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

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
