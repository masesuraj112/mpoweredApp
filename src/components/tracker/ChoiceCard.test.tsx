import { fireEvent, render, screen } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';

import { ChoiceCard } from './ChoiceCard';
import { ChoiceTextInput } from './ChoiceTextInput';
import { MultiChoiceList } from './MultiChoiceList';
import { ScaleSliderInput } from './ScaleSliderInput';
import { SingleChoiceInput } from './SingleChoiceInput';

describe('ChoiceCard', () => {
  it('shows the title as a heading, the prompt and the question number', async () => {
    await render(
      <ChoiceCard title="Walking Impacts" prompt="Pick one." questionNumber={2} totalQuestions={7}>
        <Text>options</Text>
      </ChoiceCard>,
    );

    expect(screen.getByRole('header', { name: 'Walking Impacts' })).toBeTruthy();
    expect(screen.getByText('Pick one.')).toBeTruthy();
    expect(screen.getByLabelText('Question 2 of 7')).toBeTruthy();
    expect(screen.getByText('options')).toBeTruthy();
  });

  it('goes to the next question and closes the keyboard', async () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    const onRecord = jest.fn();
    await render(
      <ChoiceCard title="T" prompt="P" questionNumber={1} totalQuestions={3} onRecord={onRecord}>
        <Text>options</Text>
      </ChoiceCard>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(onRecord).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalled();
  });

  it('says Record on the last question', async () => {
    await render(
      <ChoiceCard title="T" prompt="P" questionNumber={3} totalQuestions={3} onRecord={jest.fn()}>
        <Text>options</Text>
      </ChoiceCard>,
    );

    expect(screen.getByRole('button', { name: 'Record' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('disables Next until the question can be answered', async () => {
    await render(
      <ChoiceCard title="T" prompt="P" onRecord={jest.fn()} disabled>
        <Text>options</Text>
      </ChoiceCard>,
    );

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('shows Previous only when there is a previous question, in every tracker', async () => {
    const { rerender } = await render(
      <ChoiceCard title="T" prompt="P" onRecord={jest.fn()}>
        <Text>options</Text>
      </ChoiceCard>,
    );
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();

    await rerender(
      <ChoiceCard title="T" prompt="P" onRecord={jest.fn()} onPrevious={jest.fn()}>
        <Text>options</Text>
      </ChoiceCard>,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();

    await rerender(
      <ChoiceCard title="T" prompt="P" onRecord={jest.fn()} variant="painTracker">
        <Text>options</Text>
      </ChoiceCard>,
    );
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
  });

  it('shows no buttons when there is nothing to go to', async () => {
    await render(
      <ChoiceCard title="T" prompt="P">
        <Text>options</Text>
      </ChoiceCard>,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows a validation message', async () => {
    await render(
      <ChoiceCard title="T" prompt="P" validationMessage="Please answer this question.">
        <Text>options</Text>
      </ChoiceCard>,
    );

    expect(screen.getByText('Please answer this question.')).toBeTruthy();
  });
});

describe('SingleChoiceInput', () => {
  it('enables Next only once an option is chosen', async () => {
    const onSelectionChange = jest.fn();
    await render(
      <SingleChoiceInput
        titleText="Sleeping"
        options={['Well', 'Badly']}
        questionNumber={1}
        totalQuestions={2}
        onRecord={jest.fn()}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Badly' }));

    expect(onSelectionChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('radio', { name: 'Badly', checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Well', checked: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });
});

describe('MultiChoiceList', () => {
  const options = ['Neck', 'Back', 'Knee'];

  it('lets more than one option be chosen', async () => {
    const onSelectionChange = jest.fn();
    await render(
      <MultiChoiceList title="Where" prompt="Where does it hurt?" options={options} onSelectionChange={onSelectionChange} />,
    );

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Neck' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Knee' }));

    expect(onSelectionChange).toHaveBeenLastCalledWith([0, 2]);
    expect(screen.getByRole('checkbox', { name: 'Neck', checked: true })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Back', checked: false })).toBeTruthy();
  });

  it('lets the caller handle a press instead of toggling', async () => {
    const onSelectionChange = jest.fn();
    await render(
      <MultiChoiceList
        title="Where"
        prompt="?"
        options={options}
        onSelectionChange={onSelectionChange}
        onOptionPress={() => true}
      />,
    );

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Neck' }));

    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it('filters by the search text and lets a chosen option be removed from its chip', async () => {
    await render(
      <MultiChoiceList
        title="Where"
        prompt="?"
        options={options}
        variant="painTracker"
        selectedIndices={[1]}
        onSelectionChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Remove Back' })).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Search'), 'kn');

    expect(screen.getByRole('checkbox', { name: 'Knee' })).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Neck' })).toBeNull();
  });
});

describe('ChoiceTextInput', () => {
  it('reports what is typed', async () => {
    const onChangeText = jest.fn();
    await render(
      <ChoiceTextInput accessibilityLabel="Reflection" value="" onChangeText={onChangeText} placeholder="Write here" />,
    );

    await fireEvent.changeText(screen.getByLabelText('Reflection'), 'Hello');

    expect(onChangeText).toHaveBeenCalledWith('Hello');
    expect(screen.getByPlaceholderText('Write here')).toBeTruthy();
  });
});

describe('ScaleSliderInput', () => {
  it('keeps a typed score between 0 and 10', async () => {
    const onValueChange = jest.fn();
    await render(
      <ScaleSliderInput
        titleText="Current pain"
        underLinedText="current pain"
        variant="painTracker"
        onValueChange={onValueChange}
      />,
    );

    await fireEvent.changeText(screen.getByLabelText('My current pain from 0 to 10'), '15');

    expect(onValueChange).toHaveBeenLastCalledWith(10);
  });

  it('shows the 0 to 10 placeholder until a score is entered, outside the pain tracker', async () => {
    const onValueChange = jest.fn();
    await render(<ScaleSliderInput titleText="Mood" questionText="How was your mood?" onValueChange={onValueChange} />);

    expect(screen.getByPlaceholderText('0 to 10')).toBeTruthy();
    expect(screen.getByText('How was your mood?')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('My score from 0 to 10'), '4');

    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });
});
