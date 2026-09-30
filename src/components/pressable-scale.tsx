import type { ReactNode } from 'react';
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Springs } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  /** How far it shrinks while held; cards 0.97, small controls 0.94. */
  pressedScale?: number;
  /** Controls drawn over it (a heart on a photo) that shrink with it but are
   * their own buttons: a button inside a button is invalid on the web. */
  overlay?: ReactNode;
};

/**
 * A card or tile that shrinks slightly under the finger and springs back,
 * the way App Store cards do. With Reduce Motion on it dims instead.
 */
export function PressableScale({
  style,
  children,
  pressedScale = 0.97,
  overlay,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animated = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: 1 - pressed.value * 0.3 }
      : { transform: [{ scale: 1 - pressed.value * (1 - pressedScale) }] },
  );

  const handlers = {
    onPressIn: (event: GestureResponderEvent) => {
      pressed.value = withSpring(1, Springs.snappy);
      onPressIn?.(event);
    },
    onPressOut: (event: GestureResponderEvent) => {
      pressed.value = withSpring(0, Springs.snappy);
      onPressOut?.(event);
    },
  };

  if (overlay) {
    return (
      <Animated.View style={animated}>
        <Pressable {...rest} {...handlers} style={style}>
          {children}
        </Pressable>
        {overlay}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable {...rest} {...handlers} style={[style, animated]}>
      {children}
    </AnimatedPressable>
  );
}
