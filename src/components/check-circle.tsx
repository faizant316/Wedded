import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/icon';
import { Sizes, Springs, useColors } from '@/constants/theme';
import { Motion } from '@/lib/motion';

export type CheckCircleProps = {
  checked: boolean;
  onPress: () => void;
  /** What ticking it means, e.g. "DJ booked". */
  accessibilityLabel: string;
  /** Shown but not changeable (a relative who can only view the plan). */
  disabled?: boolean;
};

const SIZE = Sizes.checkbox;

/**
 * The round tick from Reminders: it dips under the finger, fills with the
 * app colour and the checkmark pops in. The tap target is 44 or more.
 */
export function CheckCircle({ checked, onPress, accessibilityLabel, disabled }: CheckCircleProps) {
  const Colors = useColors();
  const reduceMotion = useReducedMotion();
  const on = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  const off = Colors.borderInput;
  const fill = Colors.primaryFill;

  useEffect(() => {
    on.value = reduceMotion ? (checked ? 1 : 0) : withTiming(checked ? 1 : 0, { duration: 180 });
  }, [checked, on, reduceMotion]);

  const circle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(on.value, [0, 1], [off, fill]),
    backgroundColor: interpolateColor(on.value, [0, 1], ['rgba(0,0,0,0)', fill]),
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={10}
      onPress={() => {
        if (!reduceMotion) {
          scale.set(
            withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, Springs.snappy)),
          );
        }
        onPress();
      }}
    >
      <Animated.View
        style={[
          {
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: 1.5,
            alignItems: 'center',
            justifyContent: 'center',
          },
          circle,
        ]}
      >
        {checked && (
          <Animated.View entering={Motion.popIn} exiting={Motion.popOut}>
            <Icon name="checkmark" size={16} color={Colors.onPrimary} weight="bold" />
          </Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}
