import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { BrandText } from './BrandText';

describe('BrandText', () => {
  it('reads the whole sentence as one, with MPowered in it', async () => {
    await render(<BrandText style={{ fontSize: 20 }}>{'Let’s build your MPowered plan.'}</BrandText>);
    expect(screen.getByLabelText('Let’s build your MPowered plan.')).toBeTruthy();
  });

  it('sets every word and the wordmark on one baseline', async () => {
    await render(<BrandText style={{ fontSize: 20, textAlign: 'center', marginTop: 8 }}>{'an MPowered start!'}</BrandText>);
    const row = StyleSheet.flatten(screen.getByLabelText('an MPowered start!').props.style);
    expect(row).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'center', marginTop: 8 });
    expect(screen.getByText('an')).toBeTruthy();
    expect(screen.getByText('start!')).toBeTruthy();
  });

  it('is plain text when there is no MPowered in it', async () => {
    await render(<BrandText style={{ fontSize: 20 }}>Nothing to draw</BrandText>);
    expect(screen.getByText('Nothing to draw')).toBeTruthy();
  });
});
