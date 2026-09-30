import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Glass, hasNativeGlass } from '@/components/glass';
import { makeStyles, Sizes, Springs } from '@/constants/theme';
import type { Locale } from '@/i18n';
import { selectionHaptic } from '@/lib/haptics';

export type SegmentedOption<T extends string> = { value: T; label: string; lang?: Locale };

export type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** What the choice is, e.g. "Text size". */
  accessibilityLabel: string;
};

const PAD = 3;

/**
 * The iOS 26 segmented control: a grey capsule with a thumb (glass on iOS 26)
 * that springs to the picked option, stretching as it slides. Labels wrap rather than clip.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const itemWidth = width > 0 ? (width - PAD * 2) / options.length : 0;
  const x = useSharedValue(0);
  // Stretches as it slides and settles back, like a drop of liquid.
  const stretch = useSharedValue(1);

  useEffect(() => {
    const target = index * itemWidth;
    if (reduceMotion || itemWidth === 0) {
      x.value = target;
      return;
    }
    x.value = withSpring(target, Springs.snappy);
    stretch.value = withSequence(
      withTiming(1.18, { duration: 110 }),
      withSpring(1, Springs.stretch),
    );
  }, [index, itemWidth, reduceMotion, x, stretch]);

  const thumb = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scaleX: stretch.value }],
  }));

  return (
    <View
      style={styles.track}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {itemWidth > 0 && (
        <Animated.View style={[styles.thumb, { width: itemWidth }, thumb]}>
          {/* iOS 26 draws the thumb in glass; elsewhere a raised white capsule. */}
          {hasNativeGlass ? (
            <Glass interactive style={styles.fill} />
          ) : (
            <View style={[styles.fill, styles.solid]} />
          )}
        </Animated.View>
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => {
              if (!selected) selectionHaptic();
              onChange(option.value);
            }}
            style={styles.option}
          >
            <AppText
              variant="label"
              weight={selected ? 600 : 500}
              lang={option.lang}
              style={styles.label}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  track: {
    minHeight: Sizes.tapTarget - 4,
    flexDirection: 'row',
    padding: PAD,
    borderRadius: 999,
    backgroundColor: Colors.fill,
  },
  thumb: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    pointerEvents: 'none',
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
  solid: {
    backgroundColor: Colors.thumb,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12), 0 1px 1px rgba(0, 0, 0, 0.06)',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  label: {
    textAlign: 'center',
  },
}));
