import { createContext, useContext } from 'react';
import {
  Platform,
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Design tokens. The look follows Apple's iOS 26 system design (see
 * docs/DECISIONS.md, 2026-09-29): grouped-grey pages, white inset-grouped
 * rows and cards, system type, and one tint colour (maroon), the way an Apple
 * app has one accent. Glass is only for floating chrome (tab bar, bars over
 * photos, sheet buttons), never for content.
 * Light and dark palettes share every key. Contrast ratios next to text
 * colours were computed against `surface` and, where it matters, `bg`.
 * Components read colours with useColors() and build styles with makeStyles(),
 * so everything follows Settings > Appearance.
 */

const light = {
  bg: '#F2F2F7', // iOS systemGroupedBackground: the page behind grouped rows and cards
  surface: '#FFFFFF', // secondarySystemGroupedBackground: rows, cards, sheets
  surface2: '#F2F2F7', // a panel inside a card
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
  primary: '#8A1C30', // maroon, the tint for text and icons: links, active tab. 9.2:1
  primaryFill: '#8A1C30', // behind white text: filled buttons, selected chips. White on it 9.2:1
  primaryFillPressed: '#6E1526',
  primaryTint: '#F5E8EB', // maroon at about 10 percent: tinted buttons, selected rows
  accent: '#F0A030', // marigold: fills only, never text
  kesari: '#A8500A', // text-safe saffron, "Founding vendor" text
  kesariTint: '#FBEFE3', // saffron at about 10 percent, behind founding numbers
  success: '#1F7A35', // a deeper systemGreen: 5.4:1 on white (iOS's Increase Contrast green is 4.4:1)
  pink: '#B4335C',
  verified: '#1F6F5F',
  error: '#D70015', // systemRed with Increase Contrast, 5.1:1 (the default #FF3B30 is 3.6:1)
  errorFill: '#D70015', // behind white text: 5.4:1
  errorFillPressed: '#A50010',
  skeleton: '#E5E5EA',
  scrim: 'rgba(0, 0, 0, 0.4)',
  onPrimary: '#FFFFFF',
  // Glass where the real material isn't available (Android, older iOS, the
  // web without backdrop blur): a milky white that keeps text legible.
  glassFallback: 'rgba(250, 250, 252, 0.94)',
  glassWeb: 'rgba(255, 255, 255, 0.62)',
  glassEdge: 'rgba(255, 255, 255, 0.7)',
  glassShadow: 'rgba(0, 0, 0, 0.12)',
  // iOS 26's scroll edge effect behind the nav bar: the page colour fading out.
  scrollEdge:
    'linear-gradient(to bottom, rgba(242, 242, 247, 0.97) 0%, rgba(242, 242, 247, 0.9) 72%, rgba(242, 242, 247, 0) 100%)',
  onPhoto: '#FFFFFF', // text and glyphs on photos, over a scrim
  photoScrim: 'rgba(0, 0, 0, 0.45)',
  viewer: '#000000', // full-screen photo viewer background (vision S10)
  qrDark: '#000000', // QR codes: scanners need true black on white
  qrLight: '#FFFFFF',
  desk: '#E8E8ED', // around the phone frame in a computer's browser
  thumb: '#FFFFFF', // the selected half of a segmented control, and a switch's knob
  // Aurora (2026-09-30): three soft glows of the palette's colours drifting
  // behind large titles (maroon, marigold and pink here). Fills only, low
  // opacity; text never sits on a glow alone.
  auroraA: 'rgba(138, 28, 48, 0.20)',
  auroraB: 'rgba(240, 160, 48, 0.28)',
  auroraC: 'rgba(180, 51, 92, 0.18)',
  auroraFade: 'linear-gradient(to bottom, rgba(242, 242, 247, 0) 45%, rgba(242, 242, 247, 1) 100%)',
  // The glyph disc on Home's vendor-type tiles: white icon on a maroon sheen.
  glyphFill: 'linear-gradient(135deg, #A0233A 0%, #8A1C30 55%, #B4335C 100%)',
};

export type Palette = Record<keyof typeof light, string>;
export type ColorToken = keyof Palette;

/** iOS dark mode: true black page, raised grey surfaces, a lighter tint. */
const dark: Palette = {
  bg: '#000000',
  surface: '#1C1C1E',
  surface2: '#2C2C2E',
  text: '#FFFFFF',
  text2: '#A1A1A6', // 6.6:1 on surface, 8.2:1 on bg
  textDisabled: '#636366',
  chevron: '#6E6E73', // 3.4:1, non-text
  separator: '#38383A',
  border: '#2C2C2E',
  borderInput: '#6E6E73', // 3.4:1
  fill: 'rgba(118, 118, 128, 0.24)',
  fillPressed: 'rgba(118, 118, 128, 0.36)',
  rowPressed: '#2C2C2E',
  // Maroon is too dark to read on black, so text and icons use a lighter rose
  // (6.1:1 on surface) and filled buttons a deeper one (white on it 5.7:1).
  primary: '#F2718A',
  primaryFill: '#B8354E',
  primaryFillPressed: '#9C2A41',
  primaryTint: '#33161D', // primary on it 5.9:1
  accent: '#F2B04A',
  kesari: '#F0A04B', // 8:1
  kesariTint: '#3A2A14',
  success: '#30D158',
  pink: '#FF6B9A',
  verified: '#4FC3A9',
  error: '#FF6961', // 6:1
  errorFill: '#C4302B', // white on it 5.5:1
  errorFillPressed: '#A32520',
  skeleton: '#2C2C2E',
  scrim: 'rgba(0, 0, 0, 0.6)',
  onPrimary: '#FFFFFF',
  glassFallback: 'rgba(44, 44, 46, 0.94)',
  glassWeb: 'rgba(40, 40, 42, 0.55)',
  glassEdge: 'rgba(255, 255, 255, 0.12)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  scrollEdge:
    'linear-gradient(to bottom, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 72%, rgba(0, 0, 0, 0) 100%)',
  onPhoto: '#FFFFFF',
  photoScrim: 'rgba(0, 0, 0, 0.5)',
  viewer: '#000000',
  qrDark: '#000000',
  qrLight: '#FFFFFF',
  desk: '#101012',
  thumb: '#636366',
  auroraA: 'rgba(242, 113, 138, 0.20)',
  auroraB: 'rgba(242, 176, 74, 0.14)',
  auroraC: 'rgba(255, 107, 154, 0.14)',
  auroraFade: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 1) 100%)',
  glyphFill: 'linear-gradient(135deg, #C23E58 0%, #B8354E 55%, #C9457A 100%)',
};

export type Scheme = 'light' | 'dark';

/** "#8A1C30" and 0.2 → "rgba(138, 28, 48, 0.2)". */
function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** The colours that follow the page colour: the nav bar's edge fade and the aurora's. */
function pageFades(bg: string) {
  return {
    scrollEdge: `linear-gradient(to bottom, ${rgba(bg, 0.97)} 0%, ${rgba(bg, 0.9)} 72%, ${rgba(bg, 0)} 100%)`,
    auroraFade: `linear-gradient(to bottom, ${rgba(bg, 0)} 45%, ${rgba(bg, 1)} 100%)`,
  };
}

/**
 * Colour options (Settings > Appearance > Colour, a preview for the founders to
 * choose from; DECISIONS 2026-09-30). Each palette has a light and a dark
 * version and only changes the tint, page and accent colours; errors, greens
 * and the neutrals stay Apple's. Every text colour is at least 4.5:1 on the
 * backgrounds it sits on, checked by theme.test.ts.
 */
export type PaletteId = 'classic' | 'midnight' | 'rose' | 'emerald' | 'nebula';
export const PALETTE_IDS: PaletteId[] = ['classic', 'midnight', 'rose', 'emerald', 'nebula'];

type Overrides = Partial<Palette> & { bg: string };

// Dark palettes on a coloured page tint their separators, fills and glass too.
function darkSurfaces(bg: string, surface: string, surface2: string): Overrides {
  return {
    bg,
    surface,
    surface2,
    separator: surface2,
    border: surface2,
    rowPressed: surface2,
    skeleton: surface2,
    glassFallback: rgba(surface2, 0.94),
    glassWeb: rgba(surface, 0.55),
    desk: bg,
  };
}

const OVERRIDES: Record<Exclude<PaletteId, 'classic'>, Record<Scheme, Overrides>> = {
  // Deep navy with champagne gold.
  midnight: {
    light: {
      bg: '#F2F3F8',
      surface2: '#EEF0F6',
      primary: '#1D2B53', // 13.6:1
      primaryFill: '#1D2B53',
      primaryFillPressed: '#131D3B',
      primaryTint: '#E6EAF4',
      accent: '#D4B67A',
      kesari: '#7D5A14', // 6.3:1
      kesariTint: '#F6EEDC',
      auroraA: 'rgba(29, 43, 83, 0.16)',
      auroraB: 'rgba(212, 182, 122, 0.30)',
      auroraC: 'rgba(110, 130, 210, 0.16)',
      glyphFill: 'linear-gradient(135deg, #2C3E72 0%, #1D2B53 55%, #3B4F8C 100%)',
    },
    dark: {
      ...darkSurfaces('#070B18', '#121A2E', '#1B2540'),
      text2: '#A9B0C2',
      borderInput: '#6B7590',
      chevron: '#6B7590',
      primary: '#E6C98E', // champagne, 10.6:1 on surface
      primaryFill: '#DDBE7E', // with navy text on it
      primaryFillPressed: '#C9A865',
      primaryTint: '#2A2A2A',
      onPrimary: '#0A0F1F',
      accent: '#E6C98E',
      kesari: '#E6C98E',
      kesariTint: '#2B2618',
      auroraA: 'rgba(90, 120, 220, 0.22)',
      auroraB: 'rgba(227, 200, 143, 0.14)',
      auroraC: 'rgba(150, 120, 230, 0.14)',
      glyphFill: 'linear-gradient(135deg, #EDD6A3 0%, #DDBE7E 55%, #C9A865 100%)',
    },
  },
  // Blush pages, rose links, charcoal buttons.
  rose: {
    light: {
      bg: '#FAF2F4',
      surface2: '#F6E8EC',
      primary: '#A12D55', // 6.9:1
      primaryFill: '#2E2A2D',
      primaryFillPressed: '#1C191B',
      primaryTint: '#F7E1E8',
      accent: '#E8A0B4',
      kesari: '#8F4A1C',
      kesariTint: '#FBEDE3',
      auroraA: 'rgba(214, 120, 150, 0.24)',
      auroraB: 'rgba(250, 200, 190, 0.35)',
      auroraC: 'rgba(46, 42, 45, 0.08)',
      glyphFill: 'linear-gradient(135deg, #3A3438 0%, #2E2A2D 55%, #4A3A41 100%)',
    },
    dark: {
      ...darkSurfaces('#110B0D', '#21181C', '#2E2227'),
      text2: '#B3A4AA',
      borderInput: '#7A6A70',
      chevron: '#7A6A70',
      primary: '#F4A7C0',
      primaryFill: '#F0A2BC', // with charcoal text on it
      primaryFillPressed: '#DD8AA6',
      primaryTint: '#3A2029',
      onPrimary: '#241419',
      accent: '#F4A7C0',
      kesari: '#F2B98C',
      kesariTint: '#3A2A1E',
      auroraA: 'rgba(244, 167, 192, 0.18)',
      auroraB: 'rgba(242, 185, 140, 0.12)',
      auroraC: 'rgba(180, 100, 160, 0.14)',
      glyphFill: 'linear-gradient(135deg, #F7B8CC 0%, #F0A2BC 55%, #E48DAA 100%)',
    },
  },
  // Emerald with gold.
  emerald: {
    light: {
      bg: '#EFF4F1',
      surface2: '#E8F0EB',
      primary: '#0E5A43', // 8.4:1
      primaryFill: '#0E5A43',
      primaryFillPressed: '#094431',
      primaryTint: '#DFEEE7',
      accent: '#D4A437',
      kesari: '#7F5B0E',
      kesariTint: '#F7EFD9',
      auroraA: 'rgba(14, 90, 67, 0.16)',
      auroraB: 'rgba(212, 164, 55, 0.26)',
      auroraC: 'rgba(60, 160, 130, 0.16)',
      glyphFill: 'linear-gradient(135deg, #147052 0%, #0E5A43 55%, #1B7A5C 100%)',
    },
    dark: {
      ...darkSurfaces('#05110C', '#0F1F18', '#182D24'),
      text2: '#9FB5AB',
      borderInput: '#627A70',
      chevron: '#627A70',
      primary: '#6BD9AE',
      primaryFill: '#5CCFA2', // with deep green text on it
      primaryFillPressed: '#47B98C',
      primaryTint: '#15332A',
      onPrimary: '#052016',
      accent: '#E8C160',
      kesari: '#E8C160',
      kesariTint: '#2E2812',
      auroraA: 'rgba(107, 217, 174, 0.16)',
      auroraB: 'rgba(232, 193, 96, 0.12)',
      auroraC: 'rgba(40, 140, 110, 0.18)',
      glyphFill: 'linear-gradient(135deg, #7BE3BA 0%, #5CCFA2 55%, #47B98C 100%)',
    },
  },
  // The futuristic one: electric violet with an aqua accent.
  nebula: {
    light: {
      bg: '#F3F2FA',
      surface2: '#EDEBF8',
      primary: '#5227D6', // 7.9:1
      primaryFill: '#5227D6',
      primaryFillPressed: '#3F1CB0',
      primaryTint: '#ECE6FD',
      accent: '#2EC5D6',
      kesari: '#0B6E7A',
      kesariTint: '#DFF5F7',
      auroraA: 'rgba(82, 39, 214, 0.18)',
      auroraB: 'rgba(46, 197, 214, 0.22)',
      auroraC: 'rgba(200, 60, 200, 0.14)',
      glyphFill: 'linear-gradient(135deg, #6A3CF0 0%, #5227D6 55%, #3A56D8 100%)',
    },
    dark: {
      ...darkSurfaces('#07061A', '#141128', '#1F1A3B'),
      text2: '#AAA5C6',
      borderInput: '#6E6892',
      chevron: '#6E6892',
      primary: '#B3A4FF',
      primaryFill: '#A695FF', // with deep violet text on it
      primaryFillPressed: '#8F7BF5',
      primaryTint: '#2A2250',
      onPrimary: '#100A2E',
      accent: '#5CE1F0',
      kesari: '#5CE1F0',
      kesariTint: '#12303A',
      auroraA: 'rgba(140, 110, 255, 0.26)',
      auroraB: 'rgba(70, 224, 240, 0.16)',
      auroraC: 'rgba(220, 80, 220, 0.16)',
      glyphFill: 'linear-gradient(135deg, #BFB2FF 0%, #A695FF 55%, #7FC8F5 100%)',
    },
  },
};

function build(base: Palette, overrides: Overrides): Palette {
  return { ...base, ...overrides, ...pageFades(overrides.bg) };
}

/** Every palette, light and dark. */
export const Themes = {
  classic: { light, dark },
  ...Object.fromEntries(
    Object.entries(OVERRIDES).map(([id, schemes]) => [
      id,
      { light: build(light, schemes.light), dark: build(dark, schemes.dark) },
    ]),
  ),
} as Record<PaletteId, Record<Scheme, Palette>>;

/** Classic, light and dark: for things that always print or show in the brand's first colours. */
export const Palettes: Record<Scheme, Palette> = Themes.classic;

// The scheme in use (Settings > Appearance, or the phone's own setting) and
// the colour palette picked in Settings. SettingsProvider fills them in.
export const SchemeContext = createContext<Scheme>('light');
export const PaletteContext = createContext<PaletteId>('classic');

export function useScheme(): Scheme {
  return useContext(SchemeContext);
}

export function usePaletteId(): PaletteId {
  return useContext(PaletteContext);
}

/** The colours in use: the picked palette in the scheme in use. */
export function useColors(): Palette {
  return Themes[usePaletteId()][useScheme()];
}

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * StyleSheet.create for every palette and scheme: pass a function of the
 * colours, get a hook that returns the sheet in use. Sheets are made the first
 * time a palette is used.
 *   const useStyles = makeStyles((Colors) => ({ card: { backgroundColor: Colors.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (colors: Palette) => T & NamedStyles<any>,
) {
  const sheets = new Map<string, T>();
  return function useStyles(): T {
    const palette = usePaletteId();
    const scheme = useScheme();
    const key = `${palette}.${scheme}`;
    let sheet = sheets.get(key);
    if (!sheet) {
      sheet = StyleSheet.create(factory(Themes[palette][scheme]));
      sheets.set(key, sheet);
    }
    return sheet;
  };
}

/**
 * The in-app text size (Settings > Text size, vision §4: elders rarely find
 * the phone's own setting). AppText multiplies every size by it, on top of
 * the phone's Dynamic Type.
 */
export const TextScaleContext = createContext(1);

export function useTextScale(): number {
  return useContext(TextScaleContext);
}

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
  button: 48,
  input: 48, // text fields and the checkbox row
  search: 48, // the capsule search field
  chip: 40, // visual height; a hit slop tops the tap target up to 48
  checkbox: 28,
  row: 52, // a grouped list row with one line
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
 * Type scale, a notch under iOS Dynamic Type's defaults so the app doesn't
 * feel zoomed in (DECISIONS 2026-09-30): Large Title 30, Title 26, headings
 * 20, body 16 (CLAUDE.md's minimum) and 17 for the names elders scan for.
 * Dynamic Type and Settings > Text size still make it all larger. Gurmukhi letterforms hang from
 * the headline and read smaller at the same nominal size, so Punjabi text
 * renders ~8% bigger with taller line height (vowel marks stack above and
 * below and clip when line height is tight).
 */
export const Typography = {
  display: { size: 30, weight: 700, lineHeight: 1.2, lineHeightPa: 1.35, maxScale: 1.6 },
  title: { size: 26, weight: 700, lineHeight: 1.2, lineHeightPa: 1.35, maxScale: 1.8 },
  section: { size: 21, weight: 700, lineHeight: 1.25, lineHeightPa: 1.4, maxScale: 1.8 },
  heading: { size: 20, weight: 600, lineHeight: 1.25, lineHeightPa: 1.45, maxScale: 2 },
  bodyLg: { size: 17, weight: 400, lineHeight: 1.3, lineHeightPa: 1.6, maxScale: 2 },
  body: { size: 16, weight: 400, lineHeight: 1.33, lineHeightPa: 1.6, maxScale: 2 },
  label: { size: 14, weight: 500, lineHeight: 1.33, lineHeightPa: 1.55, maxScale: 1.6 },
  button: { size: 16, weight: 600, lineHeight: 1.3, lineHeightPa: 1.5, maxScale: 1.6 },
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

/** A CSS gradient as a background: experimental_backgroundImage on phones, backgroundImage on the web. */
export function gradient(value: string): ViewStyle {
  return Platform.OS === 'web'
    ? ({ backgroundImage: value } as ViewStyle)
    : { experimental_backgroundImage: value };
}

/**
 * Springs for Reanimated's withSpring, after SwiftUI's presets. Motion stays
 * short (vision §4); the only visible bounce is the Save heart, with a hint of
 * give when a press is released or a highlight slides.
 */
export const Springs = {
  /** Presses and toggles: quick, settles without overshoot. */
  snappy: { mass: 1, stiffness: 520, damping: 46 },
  /** Things appearing and moving into place. */
  smooth: { mass: 1, stiffness: 260, damping: 34 },
  /** The heart popping once when saved. */
  pop: { mass: 1, stiffness: 420, damping: 16 },
  /** Letting go of a card or button: settles with the slightest overshoot, so
   * presses feel fluid rather than mechanical (2026-09-30). */
  release: { mass: 1, stiffness: 380, damping: 24 },
  /** The tab bar and segmented highlights stretching as they slide. */
  stretch: { mass: 1, stiffness: 300, damping: 20 },
} as const;
