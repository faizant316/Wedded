import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  type GestureResponderEvent,
} from 'react-native';

import { Motion } from '@/constants/theme';

/** True when the phone's Reduce Motion setting is on (vision §4: honour it). */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => active && setReduce(value));
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

type PressHandler = ((event: GestureResponderEvent) => void) | null | undefined;

/**
 * A gentle shrink while a card or button is held, and whether it's pressed.
 * Spread `handlers` on an Animated Pressable and add `transform` to its style.
 * Passes the caller's own onPressIn / onPressOut through.
 */
export function usePressFeedback(onPressIn?: PressHandler, onPressOut?: PressHandler) {
  const [scale] = useState(() => new Animated.Value(1));
  const reduceMotion = useReduceMotion();
  const [pressed, setPressed] = useState(false);

  const animate = (toValue: number) =>
    Animated.timing(scale, {
      toValue,
      duration: Motion.pressMs,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start();

  return {
    pressed,
    transform: [{ scale }],
    handlers: {
      onPressIn: (event: GestureResponderEvent) => {
        setPressed(true);
        if (!reduceMotion) animate(Motion.pressScale);
        onPressIn?.(event);
      },
      onPressOut: (event: GestureResponderEvent) => {
        setPressed(false);
        animate(1);
        onPressOut?.(event);
      },
    },
  };
}
