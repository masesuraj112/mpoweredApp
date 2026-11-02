/**
 * MPowered's colours. Screens use the semantic `Colors.light` tokens (what a colour is for); `Palette`
 * holds the raw brand colours they are made from, so the look can be changed here in one place.
 * Built from the redesigned splash (Figma 2003:362): a deep violet-to-midnight gradient for the brand,
 * a brighter violet for actions, and light lavender-tinted surfaces. Every text colour meets WCAG AA
 * against the surface it is used on (checked by theme.test.ts).
 */

import { Platform } from 'react-native';

export const Palette = {
  violet: '#391777',
  midnight: '#1C0546',
  primary: '#5B2FC2',
  primaryDeep: '#4A22A8',
  lavender: '#D0BCFE',
  lavenderSoft: '#A591CF',
  ink: '#1A1033',
  inkMuted: '#5C5470',
  inkSubtle: '#71668A',
  inkDisabled: '#A79FB8',
  paper: '#FBF9FF',
  white: '#FFFFFF',
  tint: '#F1EBFF',
  tintStrong: '#E4DAFF',
  mist: '#F4F1FA',
  line: '#E4DDF2',
  border: '#8C7BB8',
  borderStrong: '#6E5C9E',
  success: '#1B7A43',
  successContainer: '#E3F4EA',
  warning: '#7A4100',
  warningContainer: '#FFF3D6',
  error: '#B3261E',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
} as const;

export const Colors = {
  light: {
    /** Headings and body text. */
    text: Palette.ink,
    /** Secondary text: dates, hints, captions. */
    textSecondary: Palette.inkMuted,
    /** Placeholders and the least important text (still AA on the background). */
    textSubtle: Palette.inkSubtle,
    textDisabled: Palette.inkDisabled,
    /** Screens. */
    background: Palette.paper,
    /** Cards, rows, inputs and sheets that sit on the background. */
    surface: Palette.white,
    /** Quiet grouped areas. */
    surfaceMuted: Palette.mist,
    /** Tinted sections and soft buttons. */
    surfaceContainer: Palette.tint,
    backgroundElement: Palette.mist,
    backgroundSelected: Palette.tintStrong,
    primary: Palette.primary,
    primaryDeep: Palette.primaryDeep,
    onPrimary: Palette.white,
    primaryContainer: Palette.tint,
    onPrimaryContainer: Palette.primaryDeep,
    secondary: Palette.inkMuted,
    secondaryContainer: Palette.tintStrong,
    onSecondaryContainer: '#3A2470',
    onSurface: Palette.ink,
    onSurfaceVariant: Palette.inkMuted,
    /** Edges of inputs, chips and buttons: 3:1 or more, so controls are visible. */
    outline: Palette.border,
    outlineStrong: Palette.borderStrong,
    /** Decorative lines between rows and sections. */
    divider: Palette.line,
    success: Palette.success,
    successContainer: Palette.successContainer,
    warning: Palette.warning,
    warningContainer: Palette.warningContainer,
    error: Palette.error,
    errorContainer: Palette.errorContainer,
    onErrorContainer: Palette.onErrorContainer,
    backdrop: 'rgba(28, 5, 70, 0.5)',
    shadow: Palette.midnight,
    listening: Palette.primary,
    calendarSelected: Palette.primaryDeep,
    onCalendarSelected: Palette.white,
    controlBorder: Palette.inkMuted,
    controlChecked: Palette.primary,
    /** The brand gradient's colours, for things drawn on it. */
    brand: Palette.violet,
    brandDeep: Palette.midnight,
    onBrand: Palette.white,
    onBrandMuted: Palette.lavender,
    /** Unfilled part of a progress bar drawn on the brand gradient. */
    brandTrack: 'rgba(208, 188, 254, 0.25)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

/** Gradients, top to bottom (or left to right). */
export const Gradients = {
  /** The splash gradient: headers, the weekly summary, the tab bar. */
  brand: [Palette.violet, Palette.midnight],
  /** Primary buttons. */
  action: [Palette.primary, Palette.primaryDeep],
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/**
 * The welcome splash (Figma 2003:362). The same in light and dark mode, and the native splash uses the top
 * colour (app.json), so the two join up.
 */
export const SplashColors = {
  gradientTop: Palette.violet,
  gradientBottom: Palette.midnight,
  text: Palette.lavenderSoft,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 12,
  control: 10,
  pill: 999,
} as const;

/** Minimum touch target (dp) for interactive elements. */
export const MinTapTarget = 48;

/**
 * Text styles from the design (the Material 3 type scale). Spread one into a text style and add a
 * colour: `{ ...Typography.labelLarge, color: Colors.light.text }`.
 */
export const Typography = {
  /** 14/20 medium: labels and field labels. */
  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.1 },
  /** 14/20 semibold: section headings and emphasised labels. */
  labelLargeBold: { fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1 },
  /** 16/24 regular: question text and field values. */
  bodyLarge: { fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  /** 14/20 medium with wider tracking: short messages and hints. */
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500', letterSpacing: 0.25 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
