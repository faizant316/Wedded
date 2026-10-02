import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useScheme } from '@/constants/theme';

/**
 * The web's welcome hero: the knot on a soft grey, without the live silk.
 * Skia on the web needs its WebAssembly loaded first, which isn't worth it
 * for a page people rarely see in a browser.
 */
const RIBBON = {
  black: require('../../../assets/images/ribbon.png'),
  white: require('../../../assets/images/ribbon-white.png'),
};

export function SilkHero({ children }: { children?: ReactNode }) {
  const dark = useScheme() === 'dark';
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? '#0B0B0C' : '#F4F2F1' }]}>
      <View style={styles.center}>
        <Image source={dark ? RIBBON.white : RIBBON.black} style={styles.logo} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '14%',
  },
  logo: { width: 132, height: 112 },
});
