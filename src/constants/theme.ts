/**
 * MPowered's colours. Screens use the semantic `Colors.light` tokens (what a colour is for); `Palette`
 * holds the raw brand colours they are made from, so the look can be changed here in one place.
 * Built from the redesigned splash (Figma 2003:362): a deep violet-to-midnight gradient for the brand,
 * a brighter violet for actions, and light lavender-tinted surfaces. Every text colour meets WCAG AA
 * against the surface it is used on (checked by theme.test.ts).
 */

import { useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

export const Palette = {
  violet: '#391777',
  midnight: '#1C0546',
  primary: '#5B2FC2',
  primaryDeep: '#4A22A8',
  lavender: '#D0BCFE',
  lavenderSoft: '#A591CF',
  ink: '#16141D',
  inkMuted: '#4D4A57',
  inkSubtle: '#625E6C',
  inkDisabled: '#A4A1AC',
  paper: '#FFFFFF',
  white: '#FFFFFF',
  tint: '#ECE3FF',
  tintSoft: '#F7F3FF',
  tintStrong: '#D9C8FF',
  mist: '#F3EEFF',
  line: '#E5E3EA',
  border: '#7A7684',
  borderStrong: '#5C5867',
  success: '#156B39',
  successContainer: '#E3F4EA',
  warning: '#7A4100',
  warningContainer: '#FFF3D6',
  error: '#B3261E',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
} as const;

const lightColors = {
    /** Headings and body text. */
    text: Palette.ink,
    /** Secondary text: dates, hints, captions. */
    textSecondary: Palette.inkMuted,
    /** Placeholders and the least important text (still AA on the background). */
    textSubtle: Palette.inkSubtle,
    textDisabled: Palette.inkDisabled,
    /** Same as textSubtle; kept for components that name the third text level. */
    textTertiary: Palette.inkSubtle,
    /** Screens. */
    background: Palette.paper,
    /** Cards, rows, inputs and sheets that sit on the background. */
    surface: Palette.white,
    /** Quiet grouped areas. */
    surfaceMuted: Palette.mist,
    /** Grouped lists, as in Settings. */
    surfaceGrouped: Palette.mist,
    /** Tinted sections and soft buttons. */
    surfaceContainer: Palette.tint,
    /** A fill a little lighter than surfaceContainer, for a button that sits on a tinted card. */
    surfaceRaised: Palette.tintSoft,
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
    outlineMedium: Palette.border,
    /** Decorative lines between rows and sections. */
    divider: Palette.line,
    success: Palette.success,
    successStrong: Palette.success,
    successContainer: Palette.successContainer,
    onSuccessContainer: Palette.success,
    warning: Palette.warning,
    warningContainer: Palette.warningContainer,
    onWarningContainer: Palette.warning,
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
    /** A slider's empty track, and the ends of its filled part. */
    sliderTrack: Palette.tint,
    sliderFillStart: Palette.lavenderSoft,
    sliderFillEnd: Palette.primaryDeep,
    /** The brand gradient's colours, for things drawn on it. */
    brand: Palette.violet,
    brandDeep: Palette.midnight,
    onBrand: Palette.white,
    onBrandMuted: Palette.lavender,
    /** Unfilled part of a progress bar drawn on the brand gradient. */
    brandTrack: 'rgba(208, 188, 254, 0.25)',
  };

/** Every colour role, as a hex or rgba string. */
export type ThemeColors = { [K in keyof typeof lightColors]: string };

/** The same roles for dark mode: deep violet surfaces, light text, a lighter violet for actions. */
const darkColors: ThemeColors = {
    text: '#EEE8FA',
    textSecondary: '#BDB6CC',
    textSubtle: '#A9A2B8',
    textDisabled: '#6E6585',
    textTertiary: '#A9A2B8',
    background: '#120A22',
    surface: '#1B1230',
    surfaceMuted: '#170F2A',
    surfaceGrouped: '#170F2A',
    surfaceContainer: '#2A1F49',
    surfaceRaised: '#382B5E',
    backgroundElement: '#1F1636',
    backgroundSelected: '#2E2350',
    primary: '#C5B0FF',
    primaryDeep: '#D8C9FF',
    onPrimary: Palette.midnight,
    primaryContainer: '#2E2350',
    onPrimaryContainer: '#E4DAFF',
    secondary: '#BDB6CC',
    secondaryContainer: '#40307A',
    onSecondaryContainer: '#E4DAFF',
    onSurface: '#EEE8FA',
    onSurfaceVariant: '#BDB6CC',
    outline: '#8C8699',
    outlineStrong: '#ADA7B9',
    outlineMedium: '#8C8699',
    divider: '#2E2640',
    success: '#7FD49C',
    successStrong: '#7FD49C',
    successContainer: '#12351F',
    onSuccessContainer: '#B9EBC9',
    warning: '#F2C46D',
    warningContainer: '#3A2A0A',
    onWarningContainer: '#F2C46D',
    error: '#F2B8B5',
    errorContainer: '#5C1A16',
    onErrorContainer: '#F9DEDC',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
    listening: '#C5B0FF',
    calendarSelected: '#C5B0FF',
    onCalendarSelected: Palette.midnight,
    controlBorder: '#BDB6CC',
    controlChecked: '#C5B0FF',
    sliderTrack: '#2A1F49',
    sliderFillStart: '#C5B0FF',
    sliderFillEnd: '#E4DAFF',
    brand: Palette.violet,
    brandDeep: Palette.midnight,
    onBrand: Palette.white,
    onBrandMuted: Palette.lavender,
    brandTrack: 'rgba(208, 188, 254, 0.25)',
};

export const Colors = {
  light: lightColors as ThemeColors,
  dark: darkColors,
} as const;



export type ThemeColor = keyof ThemeColors;

/** Gradients, top to bottom (or left to right). */
export const Gradients = {
  /** The splash gradient: headers, the weekly summary, the tab bar. */
  brand: [Palette.violet, Palette.midnight],
  /** Primary buttons. */
  action: [Palette.primary, Palette.primaryDeep],
} as const;

/**
 * Each page's top-level heading uses Sulphur Point Bold (loaded in app/_layout.tsx); all other text,
 * smaller headings included, uses the device's own font. A custom font carries its weight in the family
 * name, so the page title style sets no `fontWeight`.
 */
export const Fonts = {
  heading: 'SulphurPoint_700Bold',
} as const;

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
 * The type scale. Spread one into a text style and add a colour: `{ ...Typography.labelLarge, color: colors.text }`.
 * Sizes are the size at the device's default text setting; the device's text size setting scales them, so
 * never turn font scaling off. Nothing is smaller than 14.
 */
export const Typography = {
  /** 34/41 in Sulphur Point: the title on each home page's gradient. */
  display: { fontFamily: Fonts.heading, fontSize: 34, lineHeight: 41 },
  /** 28/34 bold: big numbers and question cards. */
  headline: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  /** 24/30 bold: card titles. */
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  /** 20/26 bold: section headings. */
  titleSmall: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  /** 18/24: lead-in text under a title. */
  subtitle: { fontSize: 18, lineHeight: 24 },
  /** 17/24: question text, field values and reading text. */
  bodyLarge: { fontSize: 17, lineHeight: 24 },
  /** 15/22 medium: short messages and hints. */
  bodyMedium: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  /** 15/22: secondary text and descriptions. */
  bodySmall: { fontSize: 15, lineHeight: 22 },
  /** 15/20 medium: labels, field labels and buttons. */
  labelLarge: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  /** 15/20 semibold: emphasised labels. */
  labelLargeBold: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  /** 14/20: the smallest text, for captions, dates and chart labels. */
  caption: { fontSize: 14, lineHeight: 20 },
  // The names main's components use (the Material 3 scale), mapped onto the sizes above.
  /** 24/30 bold: screen titles (as `title`). */
  headlineSmall: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  /** 28/36 regular: the big message on a full-screen slide. */
  headlineMedium: { fontSize: 28, lineHeight: 36 },
  /** 22/28 bold: section and page headings. */
  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  /** 17/24 semibold: card titles and list headings. */
  titleMedium: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  /** 15/22: paragraph text (as `bodySmall`). */
  bodyMediumRegular: { fontSize: 15, lineHeight: 22 },
  /** 14/20 medium: small labels and badges. */
  labelMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  /** 14/20 medium: the smallest label. */
  labelSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
} as const;

/**
 * Spread into a native Stack's screen options: a native header's title is that page's top-level heading,
 * at 20 rather than the platform's 17 so it reads as a heading.
 */
export const HeaderTitleFonts = {
  headerTitleStyle: { fontFamily: Fonts.heading, fontSize: Typography.titleSmall.fontSize },
} as const;

/** Room the tab bar takes at the bottom of a screen that draws under it. */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Content never stretches wider than this on tablets; it is centred instead. */
export const MaxContentWidth = 640;

/** A centred column no wider than `MaxContentWidth`, for a screen's content on tablets. */
export const ContentColumn = { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' } as const;


/** The colours for the phone's current appearance (light or dark). */
export function useThemeColors(): ThemeColors {
  return useColorScheme() === 'dark' ? Colors.dark : Colors.light;
}

/*
 * The app's own text size (Settings > Display), on top of the phone's text size. 1 is the size in
 * Typography; it only ever grows, so nothing goes below 14.
 */
let textScale = 1;
const textScaleListeners = new Set<() => void>();

export function setTextScale(scale: number) {
  if (scale === textScale) return;
  textScale = scale;
  textScaleListeners.forEach((listener) => listener());
}

function subscribeToTextScale(listener: () => void) {
  textScaleListeners.add(listener);
  return () => {
    textScaleListeners.delete(listener);
  };
}

/** The current text size, re-rendering when it changes. */
export function useTextScale(): number {
  return useSyncExternalStore(subscribeToTextScale, () => textScale);
}

/** A text style at the current text size: its font size and line height grow together. */
export function scaleText<S extends TextStyle>(style: S, scale: number): S {
  if (scale === 1 || style.fontSize === undefined) return style;
  return {
    ...style,
    fontSize: Math.round(style.fontSize * scale),
    ...(style.lineHeight !== undefined && { lineHeight: Math.round(style.lineHeight * scale) }),
  };
}

/**
 * Style sheets that follow the phone's appearance and the app's text size. Each mode and size is built
 * once, the first time it is needed, so styles stay as cheap as a plain StyleSheet.create.
 */
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function makeStyles<T extends NamedStyles<T>>(factory: (colors: ThemeColors) => T): () => T {
  const sheets = new Map<string, T>();
  const sheetFor = (scheme: 'light' | 'dark', scale: number): T => {
    const key = `${scheme}:${scale}`;
    let sheet = sheets.get(key);
    if (!sheet) {
      const styles = factory(Colors[scheme]);
      const scaled = Object.fromEntries(
        Object.entries(styles).map(([name, style]) => [name, scaleText(style as TextStyle, scale)]),
      ) as T;
      sheet = StyleSheet.create(scaled);
      sheets.set(key, sheet);
    }
    return sheet;
  };
  return function useStyles() {
    const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
    return sheetFor(scheme, useTextScale());
  };
}
