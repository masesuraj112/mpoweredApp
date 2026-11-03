import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Colors, Typography } from '@/constants/theme';

import { AppText } from './AppText';

describe('AppText', () => {
  it('uses the body style and the text colour by default', async () => {
    await render(<AppText>Hello</AppText>);

    const style = StyleSheet.flatten(screen.getByText('Hello').props.style);
    expect(style).toMatchObject({ ...Typography.bodyLarge, color: Colors.light.text });
  });

  it('applies the chosen type style and colour token', async () => {
    await render(
      <AppText variant="headlineSmall" color="primary">
        Title
      </AppText>,
    );

    const style = StyleSheet.flatten(screen.getByText('Title').props.style);
    expect(style).toMatchObject({ ...Typography.headlineSmall, color: Colors.light.primary });
  });

  it('lets the caller add layout styles without losing the type style', async () => {
    await render(<AppText style={{ marginTop: 8 }}>Spaced</AppText>);

    const style = StyleSheet.flatten(screen.getByText('Spaced').props.style);
    expect(style).toMatchObject({ marginTop: 8, fontSize: Typography.bodyLarge.fontSize });
  });

  it('passes accessibility props through', async () => {
    await render(<AppText accessibilityRole="header">Heading</AppText>);

    expect(screen.getByRole('header', { name: 'Heading' })).toBeTruthy();
  });
});
