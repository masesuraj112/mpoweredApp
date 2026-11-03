/**
 * Design tokens: colours, spacing, radii, elevation and text styles. Use these instead of literals in
 * components and screens. Every colour exists in both `light` and `dark` (the app ships light only for
 * now, see docs/ui/styling.md). A token is added here only when a design value has no equivalent yet.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#6750A4',
    outline: '#CAC4D0',
    outlineStrong: '#AEAEB2',
    onSurface: '#1D1B20',
    onSurfaceVariant: '#49454F',
    surfaceContainer: '#F3EDF7',
    secondary: '#625B71',
    primaryContainer: '#EADDFF',
    onPrimary: '#FFFFFF',
    success: '#4DA32D',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    listening: '#6750A4',
    calendarSelected: '#2C2C2C',
    onCalendarSelected: '#F5F5F5',
    textDisabled: '#B3B3B3',
    error: '#B3261E',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#4A4459',
    controlBorder: '#3A3A3A',
    controlChecked: '#5B4A9E',
    surface: '#FEF7FF',
    surfaceGrouped: '#F2F2F7',
    textTertiary: 'rgba(60, 60, 67, 0.6)',
    outlineMedium: '#79747E',
    divider: '#E7E0EC',
    sliderTrack: '#E4DFF5',
    sliderFillStart: '#8B7BC7',
    sliderFillEnd: '#1A1330',
    errorContainer: '#F9DEDC',
    onErrorContainer: '#410E0B',
    successStrong: '#2E7D32',
    successContainer: '#C5E9C5',
    onSuccessContainer: '#1B5E20',
    warningContainer: '#FFF3CD',
    onWarningContainer: '#92400E',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: '#D0BCFF',
    outline: '#938F99',
    outlineStrong: '#79747E',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    surfaceContainer: '#211F26',
    secondary: '#CCC2DC',
    primaryContainer: '#4F378B',
    onPrimary: '#381E72',
    success: '#8BD97A',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    listening: '#D0BCFF',
    calendarSelected: '#E6E1E5',
    onCalendarSelected: '#1D1B20',
    textDisabled: '#79747E',
    error: '#F2B8B5',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    controlBorder: '#CAC4D0',
    controlChecked: '#D0BCFF',
    surface: '#141218',
    surfaceGrouped: '#1C1C1E',
    textTertiary: 'rgba(235, 235, 245, 0.6)',
    outlineMedium: '#938F99',
    divider: '#49454F',
    sliderTrack: '#4A4458',
    sliderFillStart: '#D0BCFF',
    sliderFillEnd: '#EADDFF',
    errorContainer: '#8C1D18',
    onErrorContainer: '#F9DEDC',
    successStrong: '#8BD97A',
    successContainer: '#1B5E20',
    onSuccessContainer: '#C5E9C5',
    warningContainer: '#5C4400',
    onWarningContainer: '#FFE08A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * The welcome splash (Figma 2003:362). The same in light and dark mode, and the native splash uses the top
 * colour (app.json), so the two join up.
 */
export const SplashColors = {
  gradientTop: '#391777',
  gradientBottom: '#1C0546',
  text: '#A591CF',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  /** Between `two` and `three`. */
  mid: 12,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  card: 12,
  control: 10,
  pill: 999,
  small: 4,
  medium: 8,
  large: 16,
  extraLarge: 24,
} as const;

/** Shadows. Spread one into a style: `{ ...Elevation.level1 }`. */
export const Elevation = {
  /** Raised pill buttons. */
  level1: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
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
  /** 14/20 regular: paragraph text. */
  bodyMediumRegular: { fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  /** 24/32 semibold: screen titles. */
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
  /** 22/28 semibold: section and page headings. */
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  /** 16/24 semibold with tracking: card titles and list headings. */
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: 0.15 },
  /** 12/16 regular: captions and helper text. */
  bodySmall: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  /** 12/16 medium: small labels, badges and calendar headings. */
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0.5 },
  /** 11/16 medium: the smallest label (superscripts and tab captions). */
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500', letterSpacing: 0.5 },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
