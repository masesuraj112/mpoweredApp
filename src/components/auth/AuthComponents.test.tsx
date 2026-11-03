import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AUTH_HEADER_CLEARANCE, AuthScreen } from './AuthScreen';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';
import { AuthOption } from './AuthOption';
import { AuthTitle } from './AuthTitle';
import { CodeInput } from './CodeInput';
import { ARTWORK_HEIGHT, ARTWORK_WIDTH, OnboardingArtwork } from './OnboardingArtwork';
import { UserTypeCard } from './UserTypeCard';

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 48 },
};

describe('AuthScreen', () => {
  const inScreen = (node: React.ReactNode) => <SafeAreaProvider initialMetrics={metrics}>{node}</SafeAreaProvider>;

  it('shows its content and a pinned footer', async () => {
    await render(
      inScreen(
        <AuthScreen footer={<Text>Footer button</Text>}>
          <Text>Body</Text>
        </AuthScreen>,
      ),
    );

    expect(screen.getByText('Body')).toBeTruthy();
    expect(screen.getByText('Footer button')).toBeTruthy();
  });

  it('leaves room for the back arrow only when there is one', async () => {
    const heightOfFirstChild = () => {
      const body = screen.getByText('Body').parent;
      const spacer = body?.parent?.children[0];
      return typeof spacer === 'string' ? undefined : StyleSheet.flatten(spacer?.props.style)?.height;
    };

    const { rerender } = await render(
      inScreen(
        <AuthScreen>
          <Text>Body</Text>
        </AuthScreen>,
      ),
    );
    expect(heightOfFirstChild()).toBe(AUTH_HEADER_CLEARANCE);

    await rerender(
      inScreen(
        <AuthScreen backArrow={false}>
          <Text>Body</Text>
        </AuthScreen>,
      ),
    );
    expect(heightOfFirstChild()).not.toBe(AUTH_HEADER_CLEARANCE);
  });
});

describe('AuthTitle', () => {
  it('is a heading', async () => {
    await render(<AuthTitle>Your name</AuthTitle>);

    expect(screen.getByRole('header', { name: 'Your name' })).toBeTruthy();
  });
});

describe('AuthButton', () => {
  it('presses when enabled', async () => {
    const onPress = jest.fn();
    await render(<AuthButton label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('cannot be pressed when disabled', async () => {
    const onPress = jest.fn();
    await render(<AuthButton label="Continue" disabled onPress={onPress} />);

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('can look pale and still be pressed, so a step can explain what is missing', async () => {
    const onPress = jest.fn();
    await render(<AuthButton label="Continue" pale onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps its spoken name while the label changes, and says it is busy', async () => {
    await render(<AuthButton label="Sending…" accessibilityLabel="Continue" busy onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Continue', busy: true })).toBeTruthy();
    expect(screen.getByText('Sending…')).toBeTruthy();
  });
});

describe('AuthOption', () => {
  it('is a radio that reports whether it is chosen', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(<AuthOption label="Female" selected={false} onPress={onPress} />);
    expect(screen.getByRole('radio', { name: 'Female', checked: false })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'Female' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(<AuthOption label="Female" selected onPress={onPress} />);
    expect(screen.getByRole('radio', { name: 'Female', checked: true })).toBeTruthy();
  });
});

describe('AuthInput', () => {
  it('is named, and reports what is typed', async () => {
    const onChangeText = jest.fn();
    await render(<AuthInput accessibilityLabel="Your name" value="" onChangeText={onChangeText} placeholder="Type your name" />);

    await fireEvent.changeText(screen.getByLabelText('Your name'), 'Sam');

    expect(onChangeText).toHaveBeenCalledWith('Sam');
    expect(screen.getByPlaceholderText('Type your name')).toBeTruthy();
  });
});

describe('UserTypeCard', () => {
  const card = (selected: boolean, onPress = jest.fn()) => (
    <UserTypeCard
      title="I am a Patient"
      description="I am managing my own health journey"
      benefits={['Track your symptoms and progress', 'Connect with your support people']}
      selected={selected}
      onPress={onPress}
    />
  );

  it('shows the title, the description and each benefit', async () => {
    await render(card(false));

    expect(screen.getByText('I am managing my own health journey')).toBeTruthy();
    expect(screen.getByText('Track your symptoms and progress')).toBeTruthy();
    expect(screen.getByText('Connect with your support people')).toBeTruthy();
  });

  it('is a radio that can be chosen', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(card(false, onPress));
    expect(screen.getByRole('radio', { name: 'I am a Patient', checked: false })).toBeTruthy();

    await fireEvent.press(screen.getByRole('radio', { name: 'I am a Patient' }));
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(card(true, onPress));
    expect(screen.getByRole('radio', { name: 'I am a Patient', checked: true })).toBeTruthy();
  });
});

describe('CodeInput', () => {
  it('shows one labelled box per digit, with the typed digits in them', async () => {
    await render(<CodeInput value="123" onChangeText={jest.fn()} length={6} />);

    expect(screen.getAllByRole('button', { name: /Enter verification code, digit/ })).toHaveLength(6);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.queryByText('4')).toBeNull();
  });

  it('takes the code through one real input, so paste and the code suggestion keep working', async () => {
    const onChangeText = jest.fn();
    await render(<CodeInput value="" onChangeText={onChangeText} length={6} />);

    const input = screen.getByLabelText('Verification code');
    expect(input.props.autoComplete).toBe('one-time-code');
    expect(input.props.maxLength).toBe(6);
    await fireEvent.changeText(input, '482916');

    expect(onChangeText).toHaveBeenCalledWith('482916');
  });
});

describe('OnboardingArtwork', () => {
  const images = [{ source: { uri: 'https://example.test/screen.png' }, x: 100, y: 50, width: 200, height: 300 }];

  it('is a decoration, hidden from screen readers', async () => {
    const { toJSON } = await render(<OnboardingArtwork images={images} scale={1} />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain('"importantForAccessibility":"no-hide-descendants"');
    expect(tree).toContain('"accessibilityElementsHidden":true');
  });

  it('scales the whole collage, and each picture within it', async () => {
    const { toJSON } = await render(<OnboardingArtwork images={images} scale={0.5} />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain(`"width":${ARTWORK_WIDTH * 0.5}`);
    expect(tree).toContain(`"height":${ARTWORK_HEIGHT * 0.5}`);
    expect(tree).toContain('"left":50');
    expect(tree).toContain('"top":25');
  });
});
