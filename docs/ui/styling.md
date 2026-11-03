# Styling guide

Audience: developers building or changing a screen. Read this before you write one; the rules apply to every screen in the app.

See also: [structure.md](structure.md) (how the UI is put together, which shell each area uses, where to look for a bug) and [refactor-history.md](refactor-history.md) (what the UI refactor changed and why).

## Rules

- Colours, spacing, radii, shadows and text styles come from `src/constants/theme.ts`. No hex or `rgba` literals in components or screens.
- Lay screens out with flex. No fixed heights and no absolute-pixel positions. Whole screens scroll inside the safe area (`Screen`).
- Leave system font scaling on. Set text with `AppText`, not hand-written `fontSize` and `fontWeight`.
- Tap targets are at least 48dp. Every interactive element has an `accessibilityRole` and a label. Nothing depends on swiping alone: a carousel needs tappable dots or buttons too.
- Add a token only when a design value has no equivalent yet. Add it to both `Colors.light` and `Colors.dark`.
- Exception: `src/features/health-profile/pdf-export.ts` builds the HTML for the PDF and keeps its own colours.

`__tests__/unit/styling-guard.test.ts` fails the build, with the file and line, if a file under `app/` or `src/` hard-codes a colour, uses the removed scale helpers or the `components/mpowered` folder, or positions a screen's layout with `position: 'absolute'`. Overlays (badges, sliders, artwork, a hidden input) belong in a component.

## Building a screen

1. Wrap it in `Screen` (or `AuthScreen`, `HealthSubpage` or `TrackerQuestionScreen`, which are built on it). Pass `edges={[]}` when a navigation header or tab bar already pads that edge.
2. Set text with `AppText variant="..." color="..."`. Use `style` for layout only (margins, alignment).
3. Use `Button`, `ChipButton`, `IconButton`, `TextField`, `Select` and the other `ui` primitives before writing a new one. Look in the table below.
4. Take spacing from `Spacing`, corners from `Radius`, colours from `Colors.light`. If a value is missing, add a token.
5. Keep the screen thin: load data with a hook from `src/features`, and pass props to components.
6. Check it on a phone with the largest system font size and with the keyboard open.

## Tokens

Defined in `src/constants/theme.ts`.

| Group | Names |
| --- | --- |
| `Spacing` | `half` 2, `one` 4, `two` 8, `mid` 12, `three` 16, `four` 24, `five` 32, `six` 64 |
| `Radius` | `small` 4, `medium` 8, `control` 10, `card` 12, `large` 16, `extraLarge` 24, `pill` |
| `Elevation` | `level1` (the raised-button shadow) |
| `MinTapTarget` | 48 |
| `Typography` | `headlineMedium` 28/36, `headlineSmall` 24/32, `titleLarge` 22/28, `titleMedium` 16/24, `bodyLarge` 16/24, `bodyMedium` and `bodyMediumRegular` 14/20, `bodySmall` 12/16, `labelLarge` and `labelLargeBold` 14/20, `labelMedium` 12/16, `labelSmall` 11/16 |
| Colours | the Material 3 names (`primary`, `onSurface`, `surfaceContainer`, `error`, `outline`, ...) plus `surface`, `surfaceGrouped`, `textSecondary`, `textTertiary`, `textDisabled`, `outlineMedium`, `divider`, `successStrong` (green text), `successContainer` / `warningContainer` (and their `on...` colours) and the slider colours |

Use `successStrong`, not `success`, for green text: `success` is below 4.5:1 contrast on white.

## Shared components

| Component | Where | Use for |
| --- | --- | --- |
| `AppText` | `components/ui` | Any text. A `variant` (a `Typography` key) and a `color` token. |
| `Screen` | `components/ui` | The page: safe area, background, padding, scrolling, width cap, optional footer. |
| `ScreenHeader` | `components/ui` | The lilac back bar. Pads from the safe-area inset; pass `padForStatusBar={false}` inside a `SafeAreaView`. |
| `Button`, `ChipButton`, `IconButton` | `components/ui` | Buttons. `Button` has `elevated`, `tonal`, `primary` and `outlined` looks, an optional `pill` shape and a `busy` state. |
| `TextField`, `Select`, `Checkbox`, `SearchBar`, `SignaturePad`, `TimeWheel`, `CalendarMonth` | `components/ui` | Form controls. |
| `CheckboxOptionRow`, `PagerDots`, `Divider`, `Card` | `components/ui` | Pick-any rows, tappable page dots, rules and cards. |
| `KeyboardDoneBar` (`useKeyboardDoneBar`) | `components/ui` | The iOS "Done" bar above number, phone and multi-line keyboards. |
| `ErrorState`, `LoadingState`, `EmptyState`, `EmbeddedSite` | `components/ui` | Screen states, and a web page inside the app. |
| `TabIcon` | `components/navigation` | The pill behind a tab bar icon. |
| `AuthScreen`, `AuthTitle`, `AuthButton`, `AuthOption`, `AuthInput`, `UserTypeCard`, `CodeInput`, `OnboardingArtwork` | `components/auth` | The sign-up and sign-in steps. |
| `TrackerQuestionScreen`, `TrackerHeader`, `ChoiceCard`, `SingleChoiceInput`, `MultiChoiceList`, `ScaleSliderInput` | `components/tracker` | A tracker question: the card fills the page and its options scroll when they do not fit. Built from `RadioOptionRow`, `ChoiceOptionList`, `ChoicePrompt`, `ChoiceTextInput`, `OtherLocationModal` and `ReflectionWordCounter`. |
| `SummaryReport`, `SummaryStatus`, `ReportSection`, `ResultSection` | `components/tracker` | The tracker summary screens, which only load their entry with `useWeekSummary` and pass props. |
| `HealthSubpage`, `PrescriptionsHeader`, `TrackingScreenHeader`, `Dropdown`, `PainTrendChart`, `PainIntensityChart`, `ProfileSectionCard` | `components/health` | The My Health sub-pages: a layout that pins a header above scrolling content, a compact picker (`field` or `chip`), the charts and a profile section. |
| `SettingsHome`, `SettingsSubpage` (`SettingsOption`, `SettingsToggle`, `SettingsSelect`), `SettingsModal` (and its rows and fields) | `components/settings` | The settings pages and popups. `SettingsSelect` is an inline menu, not a modal, because it is used inside a modal. |
| `SupportedPatientCard`, `SupportRequestCard`, `AppointmentCard`, `PillButton`, `NotificationBell`, `StatusBadge`, `PermissionChips`, `InitialsAvatar`, `SectionLabel` | `components/support-person` | The support person app. |

The Care Planner components are in `components/care-planner`.

## Dark mode

The app ships light only (`userInterfaceStyle: "light"` in `app.json`), but every colour already has a `dark` value. To turn dark mode on:

1. Add a `useTheme()` hook that returns `Colors.light` or `Colors.dark` from `useColorScheme()`.
2. Change each `StyleSheet.create({ ... Colors.light.x ... })` into a `makeStyles(theme)` function that reads the theme, and `AppText` to read the theme's colour.
3. Set `userInterfaceStyle` back to `automatic`, and check every screen in both themes.

The guard test already keeps screens free of literal colours, so step 2 is a mechanical change.

## Keyboard on Android

`android.softwareKeyboardLayoutMode` is `pan` in `app.json`, so the window does not shrink when the keyboard opens and the tab bar stays under it. Restart the dev server and reload Expo Go after changing it; an installed build needs a new `eas build`. `__tests__/unit/keyboard-layout-mode.test.ts` guards the setting.

## Old colours

Where an older branch or file still has a literal, map it like this. Near-duplicates (drift) are merged into the closest token.

| Literal | Token | Note |
| --- | --- | --- |
| `#000000` | `text` | |
| `#1D1B20`, `#1A1A1A`, `#333`, `#333333` | `onSurface` | the last three are drift |
| `#FFFFFF`, `#FFF` | `onPrimary` on a filled surface, `background` for a page | decide by context |
| `#49454F` | `onSurfaceVariant` | |
| `#525252`, `#727272` | `textSecondary` | drift |
| `#6750A4`, `#5B3FA5` | `primary` | the second is drift |
| `#5B4A9E` | `controlChecked` | |
| `#CAC4D0` | `outline` | |
| `#AEAEB2`, `#AEAEB0` | `outlineStrong` | the second is drift |
| `#79747E`, `#8A8590`, `#898A8D` | `outlineMedium` for borders, `textSecondary` for text | |
| `#B3B3B3`, `#B5B5B5` | `textDisabled` | |
| `#E7E0EC`, `#E6E0E9`, `#E0E0E0`, `#D9D9D9`, `#DADADA` | `divider` | use `surfaceContainer` where it is a background fill |
| `#F3EDF7`, `#EDE9F5`, `#F7F2FA`, `#F5EFF7`, `#F4EEFF`, `#F2EAF8` | `surfaceContainer` | |
| `#E8DEF8`, `#D9D0EE` | `secondaryContainer` | |
| `#EADDFF` | `primaryContainer` | |
| `#FEF7FF` | `surface` | |
| `#F2F2F7` | `surfaceGrouped` | |
| `rgba(60, 60, 67, 0.6)` | `textTertiary` | |
| `#B3261E`, `#D32F2F` | `error` | |
| `#2E7D32` | `successStrong` | |
| `rgba(0, 0, 0, 0.x)` | `backdrop` for scrims, `Elevation.level1` for shadows | |

## Known limitations

- The tracker question page does not scroll, so at the largest font size on a very small phone the slider card can run out of room.
- The Prev and Next buttons' spoken labels ("Previous", "Next") do not contain their visible text ("← Prev", "Next →"), which can trip voice control.
- The support person pill labels are one line, so they truncate at very large text sizes.
- Removing a chip in an uncontrolled `MultiChoiceList` does not update its own selection. Every caller controls it today.
- The verification slides move on by themselves, with no way to pause them.
