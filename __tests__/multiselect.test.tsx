import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import MedicationScreen from '../app/(tabs)/tracker/management/medication';
import GeneralScreen from '../app/(tabs)/tracker/personal-care/general';
import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { PersonalCareAssessmentProvider } from '@/features/assessments/personal-care/context';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() } }));

const checkedStates = () => screen.getAllByRole('checkbox').map(box => !!box.props.accessibilityState?.checked);

// Jest doesn't run layout, so check the style that broke it: on native, any `flex > 0` on the
// fixed-height options box makes Yoga ignore its `height` and collapse it to 0 (invisible list).
const expectOptionsBoxKeepsItsHeight = () => {
  const optionsBox = screen.getByTestId('multi-choice-options');
  const style = StyleSheet.flatten(optionsBox.props.style);
  expect(style.height).toBeGreaterThan(0);
  expect(style.flex ?? 0).toBeLessThanOrEqual(0);
};

describe('Management medication', () => {
  it('keeps its options box visible on native', async () => {
    await render(
      <ManagementAssessmentProvider>
        <MedicationScreen />
      </ManagementAssessmentProvider>,
    );
    expectOptionsBoxKeepsItsHeight();
  });

  it('selects more than one option', async () => {
    await render(
      <ManagementAssessmentProvider>
        <MedicationScreen />
      </ManagementAssessmentProvider>,
    );
    await fireEvent.press(screen.getAllByRole('checkbox')[0]);
    await fireEvent.press(screen.getAllByRole('checkbox')[1]);
    expect(checkedStates()).toEqual([true, true, false, false, false, false]);
  });
});

describe('Personal care general activities', () => {
  it('keeps its options box visible on native', async () => {
    await render(
      <PersonalCareAssessmentProvider>
        <GeneralScreen />
      </PersonalCareAssessmentProvider>,
    );
    expectOptionsBoxKeepsItsHeight();
  });

  it('selects more than one option', async () => {
    await render(
      <PersonalCareAssessmentProvider>
        <GeneralScreen />
      </PersonalCareAssessmentProvider>,
    );
    await fireEvent.press(screen.getAllByRole('checkbox')[0]);
    await fireEvent.press(screen.getAllByRole('checkbox')[2]);
    expect(checkedStates()).toEqual([true, false, true, false, false]);
  });
});
