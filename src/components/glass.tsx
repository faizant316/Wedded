import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, useColors, useScheme, type Palette } from '@/constants/theme';

// Real Liquid Glass needs iOS 26; some iOS 26 betas crash without the API
// check. Everything else gets a stand-in drawn below.
const nativeGlass =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export type GlassProps = {
  children?: ReactNode;
  /** Size, shape (borderRadius) and layout. Never animate its opacity to 0:
   * iOS drops the glass effect on a transparent view. */
  style?: StyleProp<ViewStyle>;
  /** Glows under the finger on iOS 26; use for buttons and bars you tap. */
  interactive?: boolean;
  /** For the one prominent action: tints the glass with the app colour. */
  tinted?: boolean;
  /** A different tint, e.g. red for a destructive button. */
  tintColor?: string;
};

/**
 * Apple's Liquid Glass, for chrome and controls: the tab bar, bars that float
 * above content, and on iOS 26 the buttons, selected chips and segmented
 * thumbs (DECISIONS 2026-09-30). Never for cards or rows (glass on content
 * muddles the hierarchy). On iOS 26 it is the system material;
 * on the web a blurred, saturated translucent layer; on Android and older
 * iPhones a milky white that keeps the text on it readable.
 */
export function Glass({ children, style, interactive, tinted, tintColor }: GlassProps) {
  const Colors = useColors();
  const styles = useStyles();
  const scheme = useScheme();
  if (nativeGlass) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive={interactive}
        tintColor={tintColor ?? (tinted ? Colors.primaryFill : undefined)}
        colorScheme={scheme}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        Platform.OS === 'web' ? styles.web : styles.fallback,
        tinted && styles.tinted,
        tintColor ? { backgroundColor: tintColor } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const edge = (Colors: Palette) =>
  `0 0 0 0.5px rgba(0, 0, 0, 0.06), inset 0 1px 0 ${Colors.glassEdge}`;

const useStyles = makeStyles((Colors) => ({
  web: {
    backgroundColor: Colors.glassWeb,
    // Not in React Native's types; the web passes it through (with -webkit-).
    ...({ backdropFilter: 'blur(24px) saturate(190%)' } as ViewStyle),
    boxShadow: `0 8px 28px ${Colors.glassShadow}, ${edge(Colors)}`,
  },
  fallback: {
    backgroundColor: Colors.glassFallback,
    boxShadow: `0 6px 20px ${Colors.glassShadow}, ${edge(Colors)}`,
  },
  tinted: {
    backgroundColor: Colors.primaryFill,
  },
}));

/** Whether this device draws real Liquid Glass (iOS 26 and later). */
export const hasNativeGlass = nativeGlass;
