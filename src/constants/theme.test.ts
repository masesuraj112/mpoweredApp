import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const COLOUR = /^(#[0-9a-fA-F]{6}|rgba\(\d{1,3}, \d{1,3}, \d{1,3}, (0|1|0?\.\d+)\))$/;

describe('theme tokens', () => {
  it('defines the same colour keys in light and dark mode', () => {
    expect(Object.keys(Colors.dark).sort()).toEqual(Object.keys(Colors.light).sort());
  });

  it.each(['light', 'dark'] as const)('uses valid colour values in %s mode', (mode) => {
    for (const [name, value] of Object.entries(Colors[mode])) {
      expect({ name, valid: COLOUR.test(value) }).toEqual({ name, valid: true });
    }
  });

  it('keeps the spacing and radius scales ascending', () => {
    const spacing = Object.values(Spacing);
    expect(spacing).toEqual([...spacing].sort((a, b) => a - b));
    const steps = [Radius.small, Radius.medium, Radius.card, Radius.large, Radius.extraLarge];
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });

  it('gives every text style a line height taller than its font size', () => {
    for (const [name, style] of Object.entries(Typography)) {
      expect({ name, ok: style.lineHeight > style.fontSize }).toEqual({ name, ok: true });
    }
  });
});
