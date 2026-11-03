import { fireEvent, render, screen } from '@testing-library/react-native';

import { MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';

import { OtherLocationModal } from './OtherLocationModal';
import { ReflectionWordCounter } from './ReflectionWordCounter';

function setup(previousLocations: readonly string[] = ['Outer thigh', 'Inner thigh']) {
  const onCancel = jest.fn();
  const onSave = jest.fn();
  return {
    onCancel,
    onSave,
    ready: render(
      <OtherLocationModal previousLocations={previousLocations} onCancel={onCancel} onSave={onSave} />,
    ),
  };
}

describe('OtherLocationModal', () => {
  it('saves the typed location without surrounding spaces', async () => {
    const { ready, onSave } = setup();
    await ready;

    await fireEvent.changeText(screen.getByLabelText('Other pain location'), '  Left wrist ');
    await fireEvent.press(screen.getByRole('button', { name: 'Ok' }));

    expect(onSave).toHaveBeenCalledWith('Left wrist');
  });

  it('does not save an empty box', async () => {
    const { ready, onSave } = setup();
    await ready;

    await fireEvent.changeText(screen.getByLabelText('Other pain location'), '   ');
    await fireEvent.press(screen.getByRole('button', { name: 'Ok' }));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('fills the box from a previously entered location', async () => {
    const { ready, onSave } = setup();
    await ready;

    await fireEvent.press(screen.getByRole('button', { name: 'Use Inner thigh' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Ok' }));

    expect(onSave).toHaveBeenCalledWith('Inner thigh');
  });

  it('cancels without saving', async () => {
    const { ready, onSave, onCancel } = setup();
    await ready;

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('hides the suggestions when there are none', async () => {
    const { ready } = setup([]);
    await ready;

    expect(screen.queryByText('Previously entered locations')).toBeNull();
  });
});

describe('ReflectionWordCounter', () => {
  it('shows the count against the limit', async () => {
    await render(<ReflectionWordCounter wordCount={12} overLimit={false} />);

    expect(screen.getByText(`12 / ${MAX_REFLECTION_WORDS} words`)).toBeTruthy();
  });

  it('is announced politely as it changes', async () => {
    await render(<ReflectionWordCounter wordCount={3} overLimit />);

    expect(screen.getByText(`3 / ${MAX_REFLECTION_WORDS} words`).props.accessibilityLiveRegion).toBe('polite');
  });
});
