import { Text, type TextProps } from 'react-native';

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
  const { locale } = useLocale();
  const spec = Typography[variant];
  const text = typeof children === 'string' ? children : '';
  const script: Locale = lang ?? (locale === 'pa' || hasGurmukhi(text) ? 'pa' : 'en');
  const fontWeight = weight ?? spec.weight;
  const fontSize = script === 'pa' ? spec.size * GURMUKHI_SIZE_MULTIPLIER : spec.size;
  const lineHeight = fontSize * (script === 'pa' ? spec.lineHeightPa : spec.lineHeight);

  return (
    <Text
      accessibilityLanguage={script}
      maxFontSizeMultiplier={spec.maxScale}
      {...rest}
      style={[
        {
          fontFamily: FontFamilies[script][fontWeight],
          fontSize,
          lineHeight,
          color: Colors[color],
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
