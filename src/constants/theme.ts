import { Platform, type ViewStyle } from 'react-native';

/**
 * Design tokens. See docs/PRODUCT_VISION.md section 4 ("How it looks").
 * Light theme only for now; dark mode is a Phase 8 item.
 * Contrast ratios noted next to text colours were computed against `bg` (cream).
 */

export const Colors = {
  bg: '#FFF9F0', // cream page background; easier on older eyes than pure white
  surface: '#FFFFFF', // cards and sheets
  text: '#2B1A14', // 15.9:1
  text2: '#6B5A52', // 6.3:1, secondary lines (city, distance, helper text)
  textDisabled: '#A0928A',
  border: '#EBDCCB', // decorative dividers only
  borderInput: '#9C8677', // 3.3:1, inputs and chip outlines
  primary: '#8A1C30', // maroon: buttons, active tab, links
  primaryPressed: '#6E1526',
  primaryTint: '#F7E6E9', // selected chips
  primaryDeep: '#5C0F1F', // the dark end of the maroon gradients (hero, primary buttons)
  accent: '#F0A030', // marigold: fills only, never text (2.05:1 on cream)
  accentTint: '#FDF0D9', // marigold wash behind icons
  kesari: '#A8500A', // text-safe saffron, "Founding vendor" text
  success: '#3D6B33', // mehndi green
  pink: '#B4335C',
  verified: '#1F6F5F',
  error: '#B3261E',
  errorPressed: '#8F1E18', // pressed state of red (danger) buttons
  skeleton: '#EFE3D6',
  surfacePressed: '#FBF4EA', // a card while it's pressed
  scrim: 'rgba(43, 26, 20, 0.55)',
  onPrimary: '#FFFFFF',
  onPrimary2: '#F6DCE1', // secondary text on maroon: 7.1:1 on primary, 5.8:1 on the hero's lightest stop
  viewer: '#000000', // full-screen photo viewer background (vision S10)
  qrDark: '#000000', // QR codes: scanners need true black on white
  qrLight: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof Colors;

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
  card: 20,
  button: 16,
  chip: 22,
  sheet: 24,
  tile: 16, // icon tiles on rows and category cards
  checkbox: 6,
  circle: 999,
} as const;

/** Minimum sizes from the design rules: nothing tappable is under 48. */
export const Sizes = {
  tapTarget: 48,
  button: 56,
  input: 56, // text fields and the checkbox row
  chip: 44, // visual height; a hit slop tops the tap target up to 48
  checkbox: 28,
  eventTile: 96, // Home event card, minimum height
  eventTilePhoto: 132, // the same card with a photo
  eventPhoto: 112, // width of that photo
  tile: 96, // category tile, minimum height
  row: 72, // list rows, e.g. the Event page's categories
  cover: 160, // vendor profile cover band until vendors have photos
  iconCircle: 56,
  tabBar: 64,
  tabIcon: 26,
  icon: 24,
  iconSmall: 20,
  iconLarge: 48,
  pageGutter: 16,
} as const;

/**
 * Soft, layered shadows (a tight contact shadow plus a wide ambient one)
 * instead of outlines, so cards lift off the cream page. `boxShadow` works on
 * iOS, Android (new architecture) and the web.
 */
export const Elevation = {
  card: '0px 1px 2px rgba(43, 26, 20, 0.06), 0px 4px 12px rgba(43, 26, 20, 0.06)',
  raised: '0px 2px 6px rgba(43, 26, 20, 0.10), 0px 14px 32px rgba(43, 26, 20, 0.14)',
  button: '0px 2px 4px rgba(92, 15, 31, 0.18), 0px 8px 18px rgba(138, 28, 48, 0.24)',
  bar: '0px -8px 24px rgba(43, 26, 20, 0.08)',
} as const;

/** CSS gradients from the brand colours. Apply with `gradient()`. */
export const Gradients = {
  // White text on it stays above 7:1 at the lightest stop.
  hero: 'linear-gradient(155deg, #A0233A 0%, #8A1C30 45%, #5C0F1F 100%)',
  primary: 'linear-gradient(180deg, #9A2238 0%, #8A1C30 60%, #7A1729 100%)',
  // The thin phulkari stripe under the Home header (vision §4).
  phulkari:
    'linear-gradient(90deg, #F0A030 0%, #A8500A 25%, #B4335C 50%, #A8500A 75%, #F0A030 100%)',
  eventEdge: 'linear-gradient(180deg, #F0A030 0%, #A8500A 100%)',
  iconWash: 'linear-gradient(140deg, #FEF5E6 0%, #FBE3BC 100%)',
  // Darkens the bottom of a cover photo so badges on it stay readable.
  photoScrim: 'linear-gradient(180deg, rgba(43, 26, 20, 0) 55%, rgba(43, 26, 20, 0.45) 100%)',
} as const;

/** A gradient background. React Native calls it experimental_backgroundImage; the web, backgroundImage. */
export function gradient(value: string): ViewStyle {
  return Platform.OS === 'web'
    ? ({ backgroundImage: value } as ViewStyle)
    : { experimental_backgroundImage: value };
}

/** Turns a gradient off again, e.g. for a pressed or disabled button. */
export const noGradient: ViewStyle =
  Platform.OS === 'web'
    ? ({ backgroundImage: 'none' } as ViewStyle)
    : { experimental_backgroundImage: [] };

/** Press feedback: short, no bounce (vision §4 Motion). */
export const Motion = {
  pressScale: 0.97,
  pressMs: 120,
} as const;

export const BorderWidth = {
  hairline: 1, // cards and dividers
  control: 1.5, // chip and pill outlines
  strong: 2, // text fields, checkboxes, secondary buttons
} as const;

/**
 * Type scale. Gurmukhi letterforms hang from the headline and read smaller at
 * the same nominal size, so Punjabi text renders ~8% bigger with taller line
 * height (vowel marks stack above and below and clip when line height is tight).
 */
export const Typography = {
  display: { size: 34, weight: 800, lineHeight: 1.2, lineHeightPa: 1.3, maxScale: 1.6 },
  title: { size: 26, weight: 800, lineHeight: 1.25, lineHeightPa: 1.35, maxScale: 1.8 },
  heading: { size: 20, weight: 800, lineHeight: 1.3, lineHeightPa: 1.4, maxScale: 2 },
  bodyLg: { size: 19, weight: 500, lineHeight: 1.45, lineHeightPa: 1.65, maxScale: 2 },
  body: { size: 17, weight: 500, lineHeight: 1.45, lineHeightPa: 1.65, maxScale: 2 },
  label: { size: 15, weight: 600, lineHeight: 1.35, lineHeightPa: 1.55, maxScale: 1.6 },
  button: { size: 18, weight: 700, lineHeight: 1.3, lineHeightPa: 1.5, maxScale: 1.6 },
  caption: { size: 13, weight: 600, lineHeight: 1.35, lineHeightPa: 1.55, maxScale: 1.5 },
} as const;

export type TypographyVariant = keyof typeof Typography;
export type FontWeight = 500 | 600 | 700 | 800;

export const GURMUKHI_SIZE_MULTIPLIER = 1.08;

/** Font family names as registered by the @expo-google-fonts packages. */
export const FontFamilies = {
  en: {
    500: 'Nunito_500Medium',
    600: 'Nunito_600SemiBold',
    700: 'Nunito_700Bold',
    800: 'Nunito_800ExtraBold',
  },
  pa: {
    500: 'MuktaMahee_500Medium',
    600: 'MuktaMahee_600SemiBold',
    700: 'MuktaMahee_700Bold',
    800: 'MuktaMahee_800ExtraBold',
  },
} as const;
