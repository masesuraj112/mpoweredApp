import { fireEvent, render, screen } from '@testing-library/react-native';
import { PlanActionBar } from '@/components/care-planner/PlanActionBar';

describe('PlanActionBar in saved mode', () => {
  // Consent is only needed for the doctor's answers, so questions can always be changed.
  it('keeps "Add or Modify Questions" enabled', async () => {
    await render(<PlanActionBar mode="saved" onModifyQuestions={jest.fn()} />);
    const button = screen.getByRole('button', { name: 'Add or Modify Questions' });
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it('calls onModifyQuestions when pressed', async () => {
    const onModifyQuestions = jest.fn();
    await render(<PlanActionBar mode="saved" onModifyQuestions={onModifyQuestions} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Add or Modify Questions' }));
    expect(onModifyQuestions).toHaveBeenCalledTimes(1);
  });
});

describe('PlanActionBar in first-time mode', () => {
  it('calls onSave when "Save" is pressed', async () => {
    const onSave = jest.fn();
    await render(<PlanActionBar mode="first-time" onModifyQuestions={jest.fn()} onSave={onSave} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables the button while saving', async () => {
    const onSave = jest.fn();
    await render(
      <PlanActionBar mode="first-time" onModifyQuestions={jest.fn()} onSave={onSave} saving />,
    );
    const button = screen.getByRole('button', { name: 'Saving appointment' });
    expect(button.props.accessibilityState?.disabled).toBe(true);
    await fireEvent.press(button);
    expect(onSave).not.toHaveBeenCalled();
  });
});
