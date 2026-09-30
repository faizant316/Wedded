import { Platform } from 'react-native';

/**
 * Design tokens. The look follows Apple's iOS 26 system design (see
 * docs/DECISIONS.md, 2026-09-29): grouped-grey pages, white inset-grouped
 * rows and cards, system type, and one tint colour (maroon), the way an Apple
 * app has one accent. Glass is only for floating chrome (tab bar, bars over
 * photos, sheet buttons), never for content.
 * Light theme only for now; dark mode is a Phase 8 item.
 * Contrast ratios noted next to text colours were computed against `surface`
 * (white) and, where it matters, `bg` (grouped grey).
 */

export const Colors = {
  bg: '#F2F2F7', // iOS systemGroupedBackground: the page behind grouped rows and cards
  surface: '#FFFFFF', // secondarySystemGroupedBackground: rows, cards, sheets
  text: '#000000', // label, 21:1
  // secondaryLabel as iOS draws it with Increase Contrast on: Apple's default
  // (#8A8A8E) is 3.4:1, too faint for elders. 5.1:1 on white, 4.6:1 on bg.
  text2: '#6C6C70',
  textDisabled: '#AEAEB2',
  chevron: '#8E8E93', // systemGray: disclosure chevrons and row glyphs (3.3:1, non-text)
  separator: '#C6C6C8', // opaqueSeparator: hairlines between grouped rows
  border: '#E5E5EA', // systemGray5: decorative edges
  borderInput: '#8E8E93', // 3.3:1 on white, text field outlines (non-text needs 3:1)
  fill: 'rgba(118, 118, 128, 0.12)', // tertiarySystemFill: search field, chips, segmented track
  fillPressed: 'rgba(118, 118, 128, 0.24)',
  rowPressed: '#E5E5EA', // a grouped row's highlight while held
  primary: '#8A1C30', // maroon, the app's tint: buttons, active tab, links. White on it 9.2:1
  primaryPressed: '#6E1526',
  primaryTint: '#F5E8EB', // maroon at about 10 percent: tinted buttons, selected rows
  accent: '#F0A030', // marigold: fills only, never text
  kesari: '#A8500A', // text-safe saffron, "Founding vendor" text
  kesariTint: '#FBEFE3', // saffron at about 10 percent, behind founding numbers
  success: '#248A3D', // systemGreen as iOS draws it with Increase Contrast, 4.6:1
  pink: '#B4335C',
  verified: '#1F6F5F',
  error: '#D70015', // systemRed with Increase Contrast, 5.1:1 (the default #FF3B30 is 3.6:1)
  errorPressed: '#A50010',
  skeleton: '#E5E5EA',
  scrim: 'rgba(0, 0, 0, 0.4)',
  onPrimary: '#FFFFFF',
  // Glass where the real material isn't available (Android, older iOS, the
  // web without backdrop blur): a milky white that keeps text legible.
  glassFallback: 'rgba(250, 250, 252, 0.94)',
  glassWeb: 'rgba(255, 255, 255, 0.62)',
  glassEdge: 'rgba(255, 255, 255, 0.7)',
  glassShadow: 'rgba(0, 0, 0, 0.12)',
  onPhoto: '#FFFFFF', // text and glyphs on photos, over a scrim
  photoScrim: 'rgba(0, 0, 0, 0.45)',
  viewer: '#000000', // full-screen photo viewer background (vision S10)
  qrDark: '#000000', // QR codes: scanners need true black on white
  qrLight: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof Colors;

/** The 8-point grid, with 4 for tight gaps. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  card: 26, // iOS 26 inset-grouped sections and cards
  photo: 18, // photos inside a card or grid
  thumb: 10,
  button: 999, // iOS 26 buttons are capsules
  field: 14, // text fields
  chip: 999,
  sheet: 38,
  checkbox: 999, // iOS draws checkmarks in circles
  circle: 999,
} as const;

/** Minimum sizes from the design rules: nothing tappable is under 48. */
export const Sizes = {
  tapTarget: 48,
  button: 52,
  input: 52, // text fields and the checkbox row
  search: 48, // the capsule search field
  chip: 40, // visual height; a hit slop tops the tap target up to 48
  checkbox: 28,
  row: 60, // a grouped list row with one line
  rowIcon: 30, // the glyph slot at the start of a row
  eventTile: 96, // Home event card, minimum height
  eventTilePhoto: 132, // the same card with a photo
  eventPhoto: 112, // width of that photo
  tile: 104, // category tile, minimum height
  cover: 160, // vendor profile cover band until vendors have photos
  iconCircle: 56,
  glassButton: 48, // round glass buttons over photos and in bars
  tabBar: 64, // the floating tab bar's height
  tabBarInset: 16, // gap between the floating tab bar and the screen edges
  tabIcon: 24,
  icon: 24,
  iconSmall: 20,
  iconLarge: 48,
  pageGutter: 16, // iOS layout margin on phones
  navBar: 52, // the compact bar that appears when a large title scrolls away
} as const;

export const BorderWidth = {
  hairline: 1, // cards and dividers
  control: 1.5, // chip and pill outlines
  strong: 2, // focused text fields
} as const;

/**
 * Type scale, mirroring iOS Dynamic Type at the default size (Large Title 34,
 * Title 1 28, Title 3 20, Body 17, Subheadline 15, Footnote 13), with a 19
 * point body for the names elders scan for. Gurmukhi letterforms hang from
 * the headline and read smaller at the same nominal size, so Punjabi text
 * renders ~8% bigger with taller line height (vowel marks stack above and
 * below and clip when line height is tight).
 */
export const Typography = {
  display: { size: 34, weight: 700, lineHeight: 1.2, lineHeightPa: 1.35, maxScale: 1.6 },
  title: { size: 28, weight: 700, lineHeight: 1.2, lineHeightPa: 1.35, maxScale: 1.8 },
  section: { size: 22, weight: 700, lineHeight: 1.25, lineHeightPa: 1.4, maxScale: 1.8 },
  heading: { size: 20, weight: 600, lineHeight: 1.25, lineHeightPa: 1.45, maxScale: 2 },
  bodyLg: { size: 19, weight: 400, lineHeight: 1.3, lineHeightPa: 1.6, maxScale: 2 },
  body: { size: 17, weight: 400, lineHeight: 1.33, lineHeightPa: 1.6, maxScale: 2 },
  label: { size: 15, weight: 500, lineHeight: 1.33, lineHeightPa: 1.55, maxScale: 1.6 },
  button: { size: 17, weight: 600, lineHeight: 1.3, lineHeightPa: 1.5, maxScale: 1.6 },
  caption: { size: 13, weight: 400, lineHeight: 1.35, lineHeightPa: 1.55, maxScale: 1.5 },
} as const;

export type TypographyVariant = keyof typeof Typography;
export type FontWeight = 400 | 500 | 600 | 700 | 800;

export const GURMUKHI_SIZE_MULTIPLIER = 1.08;

/**
 * Latin text is San Francisco on iPhone (the system font), and Inter on
 * Android and the web, the closest free match, loaded at runtime so it works
 * in Expo Go. Gurmukhi is Mukta Mahee everywhere. Loaded fonts carry their
 * weight in the family name; adding a fontWeight to them makes Android and
 * browsers draw a fake bold, so only the system font gets one.
 */
const INTER = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
} as const;

const latin = (weight: FontWeight) => (Platform.OS === 'ios' ? 'System' : INTER[weight]);

export const FontFamilies: Record<'en' | 'pa', Record<FontWeight, string>> = {
  en: {
    400: latin(400),
    500: latin(500),
    600: latin(600),
    700: latin(700),
    800: latin(800),
  },
  pa: {
    400: 'MuktaMahee_400Regular',
    500: 'MuktaMahee_500Medium',
    600: 'MuktaMahee_600SemiBold',
    700: 'MuktaMahee_700Bold',
    800: 'MuktaMahee_800ExtraBold',
  },
};

/** The style that draws `weight` in `script`: family, plus fontWeight for the system font. */
export function fontStyle(script: 'en' | 'pa', weight: FontWeight) {
  const fontFamily = FontFamilies[script][weight];
  return fontFamily === 'System'
    ? { fontFamily, fontWeight: String(weight) as `${FontWeight}` }
    : { fontFamily };
}

/**
 * Springs for Reanimated's withSpring, after SwiftUI's presets. Nothing
 * bounces except the Save heart (vision §4: short motion, no bounces).
 */
export const Springs = {
  /** Presses and toggles: quick, settles without overshoot. */
  snappy: { mass: 1, stiffness: 520, damping: 46 },
  /** Things appearing and moving into place. */
  smooth: { mass: 1, stiffness: 260, damping: 34 },
  /** The heart popping once when saved. */
  pop: { mass: 1, stiffness: 420, damping: 16 },
} as const;
