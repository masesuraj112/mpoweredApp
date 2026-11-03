# Styling guide

Audience: developers working on the UI. This page is the reference for the UI refactor (plan phases 1 to 6). Phase 6 expands it into the full styling guide.

## Rules

- Colours, spacing, radii, shadows and text styles come from `src/constants/theme.ts`. No hex or `rgba` literals in components or screens.
- Add a token only when a design value has no equivalent yet. Every colour is added to both `Colors.light` and `Colors.dark`.
- The app ships light only (`userInterfaceStyle: "light"` in `app.json`). Using tokens everywhere keeps dark mode a small follow-up.
- Exception: `src/features/health-profile/pdf-export.ts` builds HTML for the PDF and keeps its own colours.

## Tokens added in phase 1

| Token | Value (light) | Replaces |
| --- | --- | --- |
| `Colors.surface` | `#FEF7FF` | page and sheet backgrounds that used the literal |
| `Colors.surfaceGrouped` | `#F2F2F7` | grouped-list and card backgrounds |
| `Colors.textTertiary` | `rgba(60, 60, 67, 0.6)` | "saved" captions and helper text |
| `Colors.outlineMedium` | `#79747E` | mid-grey borders |
| `Colors.divider` | `#E7E0EC` | hairline rules and light borders |
| `Spacing.mid` | 12 | the 12dp gap used between `two` (8) and `three` (16) |
| `Radius.small / medium / large / extraLarge` | 4 / 8 / 16 / 24 | literal radii |
| `Elevation.level1` | shadow + elevation 2 | the raised-button shadow |
| `Typography.headlineSmall` | 24/32 semibold | screen titles |
| `Typography.titleLarge` | 22/28 semibold | page and section headings |
| `Typography.titleMedium` | 16/24 semibold | card titles |
| `Typography.bodyMediumRegular` | 14/20 regular | paragraph text |
| `Typography.bodySmall` | 12/16 regular | captions |
| `Typography.labelMedium` | 12/16 medium | small labels |
| `Typography.labelSmall` | 11/16 medium | smallest labels |

## Shared components

Use these instead of writing the same styles again.

| Component | Where | Use for |
| --- | --- | --- |
| `AppText` | `components/ui` | Any text. Pass a `variant` (a `Typography` key) and a `color` token; `style` is for layout only. |
| `Screen` | `components/ui` | The page: safe area, background, padding, scrolling, width cap, optional footer. Pass `edges={[]}` under a navigation header or tab bar. |
| `ScreenHeader` | `components/ui` | The lilac back bar. Pad from the safe-area inset by default; pass `padForStatusBar={false}` when the screen already sits in a `SafeAreaView`. |
| `Divider` | `components/ui` | A hairline rule. |
| `TabIcon` | `components/navigation` | The pill behind a tab bar icon. |
| `TrackerQuestionScreen`, `TrackerHeader` | `components/tracker` | The shell and header of the tracker question screens. |
| `SummaryReport`, `SummaryStatus`, `ReportSection`, `ResultSection` | `components/tracker` | The tracker summary screens. They only load their entry with `useWeekSummary` and pass props. |
| `PrescriptionsHeader`, `TrackingScreenHeader` | `components/health` | The My Health sub-page headers. |

## Colour mapping for the migration

Exact matches map to the token that already holds the value. Near-duplicates (visual drift) are merged into the closest token.

| Literal | Token | Note |
| --- | --- | --- |
| `#000000` | `text` | |
| `#1D1B20`, `#1A1A1A`, `#333`, `#333333` | `onSurface` | the last three are drift |
| `#FFFFFF`, `#FFF` | `onPrimary` on a filled or purple surface, `background` for a page | decide by context |
| `#49454F` | `onSurfaceVariant` | |
| `#525252`, `#727272` | `textSecondary` | drift |
| `#6750A4` | `primary` | |
| `#5B3FA5` | `primary` | drift (auth buttons and text) |
| `#5B4A9E` | `controlChecked` | |
| `#CAC4D0` | `outline` | |
| `#AEAEB2`, `#AEAEB0` | `outlineStrong` | the second is drift |
| `#79747E` | `outlineMedium` for borders, `textSecondary` for text | |
| `#8A8590`, `#898A8D` | `outlineMedium` for borders, `textSecondary` for text | drift |
| `#B3B3B3`, `#B5B5B5` | `textDisabled` | the second is drift |
| `#E7E0EC`, `#E6E0E9`, `#E0E0E0`, `#D9D9D9`, `#DADADA` | `divider` | use `surfaceContainer` where the literal is a background fill |
| `#F3EDF7`, `#EDE9F5`, `#F7F2FA`, `#F5EFF7`, `#F4EEFF`, `#F2EAF8` | `surfaceContainer` | all but the first are drift |
| `#E8DEF8`, `#D9D0EE` | `secondaryContainer` | the second is drift |
| `#EADDFF` | `primaryContainer` | |
| `#FEF7FF` | `surface` | |
| `#F2F2F7` | `surfaceGrouped` | |
| `rgba(60, 60, 67, 0.6)` | `textTertiary` | |
| `#B3261E`, `#D32F2F` | `error` | the second is drift |
| `#2E7D32` | `success` | check text contrast at migration: `#4DA32D` is below 4.5:1 on white |
| `rgba(0, 0, 0, 0.x)` | `backdrop` for modal scrims, `Elevation.level1` for shadows | |

Values not listed (for example `#FF3B30`, `#FFF3CD`, `#F9DEDC`) are single uses. Decide at migration: snap to the closest token, and add a token only if the value is used more than once.
