import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles, Radius, Sizes, Spacing } from '@/constants/theme';

/** One grey placeholder bar. */
function Bar({
  width,
  height,
  radius = 6,
}: {
  width: DimensionValue;
  height: number;
  radius?: number;
}) {
  const styles = useStyles();
  return <View style={[styles.bar, { width, height, borderRadius: radius }]} />;
}

/**
 * Loading placeholders shaped like the grouped rows they stand in for (vision
 * §4: never a lone spinner over a list): a white inset group of rows with grey
 * bars that breathe softly. Still with Reduce Motion on.
 */
export function SkeletonRows({ count = 3 }: { count?: number }) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(
      withTiming(0.45, { duration: 750, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const breathe = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View style={[styles.group, breathe]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.row, i > 0 && styles.divided]}>
          <Bar width={Sizes.rowIcon} height={Sizes.rowIcon} radius={Radius.thumb} />
          <View style={styles.lines}>
            <Bar width="62%" height={16} />
            <Bar width="38%" height={12} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const useStyles = makeStyles((Colors) => ({
  group: {
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: Sizes.row + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lines: {
    flex: 1,
    gap: Spacing.sm,
  },
  bar: {
    backgroundColor: Colors.skeleton,
  },
}));
