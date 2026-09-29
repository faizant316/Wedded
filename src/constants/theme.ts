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
  accent: '#F0A030', // marigold: fills only, never text (2.05:1 on cream)
  kesari: '#A8500A', // text-safe saffron, "Founding vendor" text
  success: '#3D6B33', // mehndi green
  pink: '#B4335C',
  verified: '#1F6F5F',
  error: '#B3261E',
  skeleton: '#EFE3D6',
  scrim: 'rgba(43, 26, 20, 0.55)',
  onPrimary: '#FFFFFF',
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
  card: 16,
  button: 14,
  chip: 22,
  sheet: 20,
  circle: 999,
} as const;

/** Minimum sizes from the design rules: nothing tappable is under 48. */
export const Sizes = {
  tapTarget: 48,
  button: 56,
  chip: 44,
  tabBar: 64,
  tabIcon: 26,
  pageGutter: 16,
} as const;

/**
 * Type scale. Gurmukhi letterforms hang from the headline and read smaller at
 * the same nominal size, so Punjabi text renders ~8% bigger with taller line
 * height (vowel marks stack above and below and clip when line height is tight).
 */
export const Typography = {
  display: { size: 32, weight: 700, lineHeight: 1.2, lineHeightPa: 1.3, maxScale: 1.6 },
  title: { size: 24, weight: 700, lineHeight: 1.25, lineHeightPa: 1.35, maxScale: 1.8 },
  heading: { size: 20, weight: 700, lineHeight: 1.3, lineHeightPa: 1.4, maxScale: 2 },
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
