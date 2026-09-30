import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Springs } from '@/constants/theme';

export type ProgressBarProps = {
  /** 0 to 1. */
  value: number;
  color: string;
  trackColor: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A capsule that fills from the left. It grows into place on first show and
 * springs to each new value, so ticking something off visibly moves it.
 */
export function ProgressBar({ value, color, trackColor, height = 6, style }: ProgressBarProps) {
  const reduceMotion = useReducedMotion();
  const target = Math.max(0, Math.min(1, value));
  const progress = useSharedValue(reduceMotion ? target : 0);

  useEffect(() => {
    progress.value = reduceMotion ? target : withSpring(target, Springs.smooth);
  }, [progress, reduceMotion, target]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target * 100) }}
      style={[
        { height, borderRadius: height / 2, overflow: 'hidden', backgroundColor: trackColor },
        style,
      ]}
    >
      <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color }, fill]} />
    </View>
  );
}
