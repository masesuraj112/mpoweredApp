import { Colors, Fonts, Gradients, Typography } from './theme';

// WCAG 2 contrast: 4.5:1 for text, 3:1 for the edges of controls (inputs, chips, checkboxes).
const TEXT = 4.5;
const CONTROL = 3;

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

type Role = keyof typeof Colors.light;

// [foreground, background, minimum]
const pairs: [Role, Role, number][] = [
  ['text', 'background', TEXT],
  ['text', 'surface', TEXT],
  ['text', 'surfaceContainer', TEXT],
  ['text', 'surfaceMuted', TEXT],
  ['textSecondary', 'background', TEXT],
  ['textSecondary', 'surface', TEXT],
  ['textSecondary', 'surfaceContainer', TEXT],
  ['textSecondary', 'surfaceMuted', TEXT],
  ['textSubtle', 'background', TEXT],
  ['textSubtle', 'surface', TEXT],
  ['primary', 'background', TEXT],
  ['primary', 'surface', TEXT],
  ['primary', 'primaryContainer', TEXT],
  ['primaryDeep', 'secondaryContainer', TEXT],
  ['onPrimary', 'primary', TEXT],
  ['onPrimary', 'primaryDeep', TEXT],
  ['onPrimaryContainer', 'primaryContainer', TEXT],
  ['onSecondaryContainer', 'secondaryContainer', TEXT],
  ['onBrand', 'brand', TEXT],
  ['onBrand', 'brandDeep', TEXT],
  ['onBrandMuted', 'brand', TEXT],
  ['onBrandMuted', 'brandDeep', TEXT],
  ['error', 'background', TEXT],
  ['error', 'surface', TEXT],
  ['onErrorContainer', 'errorContainer', TEXT],
  ['success', 'surface', TEXT],
  ['success', 'surfaceContainer', TEXT],
  ['success', 'successContainer', TEXT],
  ['warning', 'warningContainer', TEXT],
  ['onCalendarSelected', 'calendarSelected', TEXT],
  // Boxes are solid fills: surfaceContainer, and secondaryContainer when selected.
  ['primary', 'surfaceContainer', TEXT],
  ['error', 'surfaceContainer', TEXT],
  ['text', 'secondaryContainer', TEXT],
  ['textSecondary', 'secondaryContainer', TEXT],
  ['primary', 'secondaryContainer', TEXT],
  ['outline', 'background', CONTROL],
  ['outline', 'surface', CONTROL],
  ['controlBorder', 'surface', CONTROL],
  ['controlChecked', 'surface', CONTROL],
];

describe.each(['light', 'dark'] as const)('%s theme contrast (WCAG AA)', (scheme) => {
  const c = Colors[scheme];

  it.each(pairs)('%s on %s is at least %d:1', (fg, bg, min) => {
    expect(contrast(c[fg], c[bg])).toBeGreaterThanOrEqual(min);
  });

  it('keeps white text readable across the whole brand gradient', () => {
    for (const stop of Gradients.brand) expect(contrast(c.onBrand, stop)).toBeGreaterThanOrEqual(TEXT);
  });
});

describe('action gradient', () => {
  it('keeps white text readable across it (light mode buttons)', () => {
    for (const stop of Gradients.action) expect(contrast(Colors.light.onPrimary, stop)).toBeGreaterThanOrEqual(TEXT);
  });
});

describe('type scale', () => {
  it.each(Object.entries(Typography))('%s is at least 14 so it reads comfortably', (_, style) => {
    expect(style.fontSize).toBeGreaterThanOrEqual(14);
  });

  it('sets headings (20 and up) in the heading font and leaves body text to the device font', () => {
    for (const style of Object.values(Typography)) {
      const family = 'fontFamily' in style ? style.fontFamily : undefined;
      expect(family).toBe(style.fontSize >= 20 ? Fonts.heading : undefined);
    }
  });
});
