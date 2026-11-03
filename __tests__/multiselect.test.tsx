import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import MedicationScreen from '../app/(tabs)/(home)/tracker/management/medication';
import GeneralScreen from '../app/(tabs)/(home)/tracker/personal-care/general';
import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { PersonalCareAssessmentProvider } from '@/features/assessments/personal-care/context';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn() } }));

const checkedStates = () => screen.getAllByRole('checkbox').map(box => !!box.props.accessibilityState?.checked);

// Jest doesn't run layout, so verify the list's sizing mode directly: it grows with its options (the
// page scrolls), never a fixed or flex-filled box that the options could overflow.
const expectOptionsListGrowsWithItsOptions = () => {
  const optionsList = screen.getByTestId('multi-choice-options');
  const style = StyleSheet.flatten(optionsList.props.style);
  expect(style.height).toBeUndefined();
  expect(style.flex).toBeUndefined();
};

describe('Management medication', () => {
  it('lists every option at its own height', async () => {
    await render(
      <ManagementAssessmentProvider>
        <MedicationScreen />
      </ManagementAssessmentProvider>,
    );
    expectOptionsListGrowsWithItsOptions();
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
  it('lists every option at its own height', async () => {
    await render(
      <PersonalCareAssessmentProvider>
        <GeneralScreen />
      </PersonalCareAssessmentProvider>,
    );
    expectOptionsListGrowsWithItsOptions();
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
