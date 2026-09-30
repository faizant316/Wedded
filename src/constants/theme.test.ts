import { PALETTE_IDS, Themes, type Palette } from './theme';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Text (4.5:1, WCAG AA) and the controls' outlines (3:1) on what they sit on.
const TEXT: [keyof Palette, keyof Palette][] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surface2'],
  ['text2', 'bg'],
  ['text2', 'surface'],
  ['primary', 'bg'],
  ['primary', 'surface'],
  ['primary', 'primaryTint'],
  ['onPrimary', 'primaryFill'],
  ['onPrimary', 'primaryFillPressed'],
  ['kesari', 'surface'],
  ['kesari', 'kesariTint'],
  ['error', 'surface'],
  ['success', 'surface'],
];
const OUTLINES: [keyof Palette, keyof Palette][] = [
  ['borderInput', 'surface'],
  ['chevron', 'surface'],
];

describe.each(PALETTE_IDS)('the %s palette', (id) => {
  describe.each(['light', 'dark'] as const)('in %s mode', (scheme) => {
    const colors = Themes[id][scheme];

    it.each(TEXT)('%s on %s is at least 4.5:1', (fg, bg) => {
      expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(4.5);
    });

    it.each(OUTLINES)('%s on %s is at least 3:1', (fg, bg) => {
      expect(contrast(colors[fg], colors[bg])).toBeGreaterThanOrEqual(3);
    });

    it('fades the nav bar and the aurora into its own page colour', () => {
      const n = parseInt(colors.bg.slice(1), 16);
      const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
      expect(colors.scrollEdge).toContain(rgb);
      expect(colors.auroraFade).toContain(rgb);
    });
  });
});
