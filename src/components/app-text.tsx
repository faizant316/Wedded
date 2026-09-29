import { Text, useWindowDimensions, type TextProps } from 'react-native';

import {
  Colors,
  FontFamilies,
  GURMUKHI_SIZE_MULTIPLIER,
  Typography,
  type ColorToken,
  type FontWeight,
  type TypographyVariant,
} from '@/constants/theme';
import { hasGurmukhi, type Locale } from '@/i18n';
import { useLocale } from '@/i18n/locale-context';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  weight?: FontWeight;
  /** Force a script; by default the app language decides, and any string that
   * contains Gurmukhi is rendered in the Gurmukhi font regardless. */
  lang?: Locale;
};

type TypeStyleOptions = {
  variant?: TypographyVariant;
  weight?: FontWeight;
  lang?: Locale;
  /** The text being shown; any Gurmukhi in it switches to the Gurmukhi font. */
  text?: string;
};

/**
 * Font family, size, line height and scaling cap for a type variant in the
 * current script. AppText uses it; so does anything that can't render AppText
 * itself, like TextInput.
 */
export function useTypeStyle({ variant = 'body', weight, lang, text = '' }: TypeStyleOptions) {
  const { locale } = useLocale();
  const spec = Typography[variant];
  const script: Locale = lang ?? (locale === 'pa' || hasGurmukhi(text) ? 'pa' : 'en');
  const fontSize = script === 'pa' ? spec.size * GURMUKHI_SIZE_MULTIPLIER : spec.size;

  return {
    script,
    fontFamily: FontFamilies[script][weight ?? spec.weight],
    fontSize,
    lineHeight: fontSize * (script === 'pa' ? spec.lineHeightPa : spec.lineHeight),
    maxFontSizeMultiplier: spec.maxScale,
  };
}

/**
 * How much the phone's text size setting enlarges a variant, capped the same
 * way AppText caps it. Multiply icon sizes by it so icons next to text keep up.
 */
export function useFontScale(variant: TypographyVariant = 'body') {
  const { fontScale } = useWindowDimensions();
  return Math.min(fontScale, Typography[variant].maxScale);
}

/**
 * The one Text component for the app. Picks the font family for the current
 * script, sets an explicit line height (Gurmukhi vowel marks clip without it),
 * and caps font scaling per variant so large-text mode never truncates.
 * Never apply `textTransform: 'uppercase'` or letter spacing to it: Gurmukhi
 * has no case, and mixed strings break.
 */
export function AppText({
  variant = 'body',
  color = 'text',
  weight,
  lang,
  style,
  children,
  ...rest
}: AppTextProps) {
  const text = typeof children === 'string' ? children : '';
  const { script, fontFamily, fontSize, lineHeight, maxFontSizeMultiplier } = useTypeStyle({
    variant,
    weight,
    lang,
    text,
  });

  return (
    <Text
      accessibilityLanguage={script}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...rest}
      style={[{ fontFamily, fontSize, lineHeight, color: Colors[color] }, style]}
    >
      {children}
    </Text>
  );
}
