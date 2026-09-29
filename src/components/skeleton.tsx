import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type DimensionValue } from 'react-native';

import { useReduceMotion } from '@/components/motion';
import { Colors, Elevation, Radius, Sizes, Spacing } from '@/constants/theme';

/** A placeholder block that pulses softly while content loads (still with Reduce Motion). */
export function SkeletonBlock({
  width = '100%',
  height,
  radius = Radius.checkbox,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
}) {
  const reduceMotion = useReduceMotion();
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reduceMotion) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity, reduceMotion]);

  return <Animated.View style={[styles.block, { width, height, borderRadius: radius, opacity }]} />;
}

/** Card-shaped placeholders for a list that's loading (vision §4: never a lone spinner). */
export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock width={Sizes.iconCircle} height={Sizes.iconCircle} radius={Radius.tile} />
          <View style={styles.lines}>
            <SkeletonBlock width="70%" height={18} />
            <SkeletonBlock width="45%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: Colors.skeleton,
  },
  list: {
    gap: Spacing.md,
  },
  card: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    backgroundColor: Colors.surface,
    boxShadow: Elevation.card,
  },
  lines: {
    flex: 1,
    gap: Spacing.sm,
  },
});
