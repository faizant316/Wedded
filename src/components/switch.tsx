import { useEffect } from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { makeStyles, Springs } from '@/constants/theme';
import { selectionHaptic } from '@/lib/haptics';

const TRACK = { width: 51, height: 31 };
const KNOB = 27;
const TRAVEL = TRACK.width - KNOB - 4;

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** What it turns on, e.g. "Haptics". */
  accessibilityLabel: string;
  disabled?: boolean;
};

/**
 * The iOS switch: a 51×31 capsule whose knob springs across, filled with the
 * app colour when on. Drawn by hand so it looks the same on Android and the
 * web. The tap area is 48 tall.
 */
export function Switch({ value, onValueChange, accessibilityLabel, disabled }: SwitchProps) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const x = useSharedValue(value ? TRAVEL : 0);

  useEffect(() => {
    const target = value ? TRAVEL : 0;
    x.value = reduceMotion ? target : withSpring(target, Springs.snappy);
  }, [value, reduceMotion, x]);

  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      hitSlop={{ top: 9, bottom: 9, left: 6, right: 6 }}
      onPress={() => {
        selectionHaptic();
        onValueChange(!value);
      }}
      style={[styles.track, value && styles.on, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.knob, knob]} />
    </Pressable>
  );
}

const useStyles = makeStyles((Colors) => ({
  track: {
    width: TRACK.width,
    height: TRACK.height,
    borderRadius: TRACK.height / 2,
    padding: 2,
    backgroundColor: Colors.fillPressed,
  },
  on: {
    backgroundColor: Colors.primaryFill,
  },
  disabled: {
    opacity: 0.5,
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16)',
  },
}));
