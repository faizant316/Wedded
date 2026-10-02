import { Canvas, Fill, Shader, Skia } from '@shopify/react-native-skia';
import { type ReactNode, useEffect, useState } from 'react';
import { Image, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useScheme } from '@/constants/theme';

/**
 * The welcome screen's hero: a sheet of satin, drawn live on the GPU (Skia),
 * with the ribbon knot floating on it. The folds drift slowly and catch the
 * light like the logo's ribbon; touching the silk gathers it toward your
 * finger, and letting go lets it fall back. The knot leans away from your
 * finger a little. With Reduce Motion the folds stand still, but touch still
 * works. The bottom fades into the page so the words below sit on plain
 * white (black in dark mode).
 */

const RIBBON = {
  black: require('../../../assets/images/ribbon.png'),
  white: require('../../../assets/images/ribbon-white.png'),
};
const LOGO_WIDTH = 132;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 430) / 509);

// Satin: a height field of slow, crossing waves, lit like fabric (a soft
// diffuse light, a tight specular glint and a broad sheen along the folds).
// `pull` gathers the cloth toward `touch`.
const SILK = Skia.RuntimeEffect.Make(`
uniform float2 size;
uniform float time;
uniform float2 touch;
uniform float pull;
uniform float dark;
uniform float3 tint;
uniform float3 page;

float folds(float2 p, float t) {
  float h = sin(p.x * 1.45 + p.y * 0.85 + t * 0.50) * 0.55;
  h += sin(p.x * -0.65 + p.y * 2.10 + t * 0.32 + sin(p.x * 0.80 + t * 0.21) * 1.40) * 0.36;
  h += sin((p.x + p.y) * 3.00 - t * 0.43 + sin(p.y * 1.30 - t * 0.27) * 0.90) * 0.11;
  return h;
}

half4 main(float2 xy) {
  float2 p = xy / size.y * 4.4;
  float2 d = p - touch / size.y * 4.4;
  p -= d * pull * 0.9 * exp(-dot(d, d) * 0.9);

  float e = 0.004;
  float h = folds(p, time);
  float3 n = normalize(float3(
    -(folds(p + float2(e, 0.0), time) - h) / e * 0.3,
    -(folds(p + float2(0.0, e), time) - h) / e * 0.3,
    1.0));
  float3 light = normalize(float3(-0.45, -0.65, 0.62));
  float diffuse = clamp(dot(n, light), 0.0, 1.0);
  float glint = pow(clamp(dot(n, normalize(light + float3(0.0, 0.0, 1.0))), 0.0, 1.0), 46.0);
  float sheen = pow(1.0 - abs(dot(n.xy, float2(0.62, -0.34))), 7.0);

  float3 colour;
  if (dark > 0.5) {
    colour = float3(0.035, 0.035, 0.04) + diffuse * 0.13 + glint * 0.24 + sheen * 0.08;
    colour += tint * 0.16 * (1.0 - diffuse);
  } else {
    colour = float3(0.975, 0.968, 0.962) * (0.68 + 0.32 * diffuse) + glint * 0.42 + sheen * 0.05;
    colour = mix(colour, tint, 0.09 * (1.0 - diffuse));
  }

  float fade = smoothstep(0.74, 1.0, xy.y / size.y);
  return half4(half3(mix(colour, page, fade)), 1.0);
}
`)!;

// The app's maroon (Colors.primaryFill), as the shadow tint in the folds
const MAROON = [0.54, 0.11, 0.2];

export function SilkHero({ children }: { children?: ReactNode }) {
  const dark = useScheme() === 'dark';
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 1, height: 1 });

  const time = useSharedValue(6);
  const touch = useSharedValue({ x: 0, y: 0 });
  const pull = useSharedValue(0);
  const float = useSharedValue(0);

  useFrameCallback((frame) => {
    time.value = 6 + (frame.timeSinceFirstFrame ?? 0) / 1000;
  }, !reduceMotion);

  // The knot rises and settles, slowly, like it's resting on the silk
  useEffect(() => {
    if (reduceMotion) return;
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    return () => cancelAnimation(float);
  }, [float, reduceMotion]);

  const uniforms = useDerivedValue(() => ({
    size: [size.width, size.height],
    time: time.value,
    touch: [touch.value.x, touch.value.y],
    pull: pull.value,
    dark: dark ? 1 : 0,
    tint: MAROON,
    page: dark ? [0, 0, 0] : [1, 1, 1],
  }));

  const knot = useAnimatedStyle(() => {
    const dx = (touch.value.x - size.width / 2) * pull.value;
    const dy = (touch.value.y - size.height / 2) * pull.value;
    return {
      transform: [
        { translateX: -dx * 0.05 },
        { translateY: -dy * 0.05 - float.value * 6 },
        { rotate: `${(-dx / size.width) * 6}deg` },
      ],
    };
  });

  function gather(event: GestureResponderEvent) {
    touch.set({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
    pull.set(withSpring(1, { mass: 1, stiffness: 180, damping: 20 }));
  }
  function follow(event: GestureResponderEvent) {
    touch.set({ x: event.nativeEvent.locationX, y: event.nativeEvent.locationY });
  }
  function release() {
    pull.set(withSpring(0, { mass: 1, stiffness: 90, damping: 9 }));
  }

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={gather}
      onResponderMove={follow}
      onResponderRelease={release}
      onResponderTerminate={release}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        <Fill>
          <Shader source={SILK} uniforms={uniforms} />
        </Fill>
      </Canvas>
      <View style={styles.center} pointerEvents="none">
        <Animated.View style={knot}>
          <Image source={dark ? RIBBON.white : RIBBON.black} style={styles.logo} />
        </Animated.View>
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
    // Below the status bar, and clear of the faded bottom of the silk
    paddingTop: 56,
    paddingBottom: '8%',
  },
  logo: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
});
