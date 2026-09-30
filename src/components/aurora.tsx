import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { gradient, useColors } from '@/constants/theme';

const DRIFT_MS = 16000;
const BLOB = 340;

/** A round glow: the colour at the centre fading to nothing at the edge. */
const glow = (color: string) =>
  gradient(`radial-gradient(circle, ${color} 0%, ${color.replace(/[\d.]+\)$/, '0)')} 70%)`);

/**
 * Aurora (DECISIONS 2026-09-30): three soft glows in maroon, marigold and
 * pink drifting slowly behind a large title, fading into the page below. It
 * makes the app its own without costing legibility: the glows are faint, and
 * titles keep their full contrast. Still with Reduce Motion on.
 */
export function Aurora({ style }: { style?: StyleProp<ViewStyle> }) {
  const Colors = useColors();
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    drift.value = withRepeat(
      withTiming(1, { duration: DRIFT_MS, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [drift, reduceMotion]);

  // Each glow drifts its own way; only the shared value goes into the worklets.
  const maroon = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [-40, 30]) },
      { translateY: interpolate(drift.value, [0, 1], [0, 30]) },
      { scale: interpolate(drift.value, [0, 1], [1, 1.15]) },
    ],
  }));
  const marigold = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [40, -30]) },
      { translateY: interpolate(drift.value, [0, 1], [20, -10]) },
      { scale: interpolate(drift.value, [0, 1], [1.1, 0.95]) },
    ],
  }));
  const pink = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [0, 50]) },
      { translateY: interpolate(drift.value, [0, 1], [30, 0]) },
    ],
  }));

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Animated.View style={[styles.blob, styles.left, glow(Colors.auroraMaroon), maroon]} />
      <Animated.View style={[styles.blob, styles.right, glow(Colors.auroraMarigold), marigold]} />
      <Animated.View style={[styles.blob, styles.middle, glow(Colors.auroraPink), pink]} />
      <View style={[StyleSheet.absoluteFill, gradient(Colors.auroraFade)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
  },
  left: {
    top: -BLOB * 0.35,
    left: -BLOB * 0.3,
  },
  right: {
    top: -BLOB * 0.2,
    right: -BLOB * 0.35,
  },
  middle: {
    top: BLOB * 0.15,
    left: BLOB * 0.25,
  },
});
