import { useCallback, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';

import { useScheme } from '@/constants/theme';

/**
 * The opening animation (like X or Instagram, but quicker): two loose ribbons
 * fly in from the sides, twirl around each other, and pull into the knot; the
 * satin logo takes over and cinches, then it zooms away and the app is there.
 * About a second, once per launch, over the app as it loads. With Reduce
 * Motion the logo just fades. Not on the web, where people arrive on a shared
 * page.
 *
 * The ribbons are drawn once, as a few still frames of the tie, and only
 * moved, turned and swapped while the app loads underneath: redrawing a shape
 * every frame stalls while the first screen mounts.
 */

const RIBBON = {
  black: require('../../assets/images/ribbon.png'),
  white: require('../../assets/images/ribbon-white.png'),
};
// The logo image (assets/images/ribbon.png) is 509 × 430. The ribbons are
// drawn in its pixels, then scaled to WIDTH on screen.
const IMAGE = { width: 509, height: 430 };
const WIDTH = 180;
const HEIGHT = Math.round((WIDTH * IMAGE.height) / IMAGE.width);
const SCALE = WIDTH / IMAGE.width;
/** The logo is symmetric about the knot. */
const MIRROR_X = 2 * 257;
/** Where the loose ribbons cross, and turn. */
const CROSS = { x: 257, y: 215 };

/**
 * The left ribbon's centre line in the logo, from the tail, up the outside,
 * over the loop, through the knot (KNOT) and down the inside leg. The right
 * ribbon is its mirror image.
 */
const TIED: readonly (readonly [number, number])[] = [
  [45, 405],
  [80, 365],
  [105, 300],
  [95, 230],
  [52, 170],
  [14, 110],
  [15, 60],
  [60, 25],
  [130, 30],
  [200, 65],
  [245, 100],
  [235, 150],
  [218, 220],
  [180, 300],
  [140, 345],
  [115, 355],
];
const KNOT = 10;
/** The same ribbon untied: a loose, gently wavy strip crossing the other in an X. */
const LOOSE = TIED.map(
  (_, i) => [230 - (KNOT - i) * 42, CROSS.y + (i - KNOT) * 14 + Math.sin(i * 0.8) * 18] as const,
);
/** While tying, the knot goes first and the ends trail in, as if pulled tight. */
const MAX_DELAY = 0.3;
/** Still frames of the tie, loose (0) to tied (FRAMES - 1). */
const FRAMES = 14;

// ms
const FLY = 260;
const TURN = 220;
const TIE = 280;
const CINCH = 150;
const REVEAL = 280;
const TIE_AT = FLY + TURN;
const REVEAL_AT = TIE_AT + TIE + CINCH + 30;
const DONE = REVEAL_AT + REVEAL + 30;

/** One ribbon, `tied` of the way from loose to tied, as an SVG path. */
function ribbonPath(tied: number, mirrored: boolean): string {
  const points = TIED.map(([tx, ty], i) => {
    const delay = (Math.abs(i - KNOT) / KNOT) * MAX_DELAY;
    const local = Math.min(1, Math.max(0, (tied - delay) / (1 - MAX_DELAY)));
    const p = 1 - Math.pow(1 - local, 3);
    const x = LOOSE[i][0] + (tx - LOOSE[i][0]) * p;
    const y = LOOSE[i][1] + (ty - LOOSE[i][1]) * p;
    return [mirrored ? MIRROR_X - x : x, y] as const;
  });
  // A smooth curve through the points (Catmull-Rom as cubic Béziers)
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    d +=
      ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}` +
      ` ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}` +
      ` ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const FRAME_PATHS = Array.from({ length: FRAMES }, (_, k) => {
  const tied = k / (FRAMES - 1);
  return { left: ribbonPath(tied, false), right: ribbonPath(tied, true) };
});

type Motion = { fly: SharedValue<number>; turn: SharedValue<number>; tie: SharedValue<number> };
type Colours = { ink: string; sheen: string };

export function AppIntro() {
  const [showing, setShowing] = useState(Platform.OS !== 'web');
  // Stable, so the app re-rendering underneath never restarts the animation
  const done = useCallback(() => setShowing(false), []);
  if (!showing) return null;
  return <Intro onDone={done} />;
}

function Intro({ onDone }: { onDone: () => void }) {
  const scheme = useScheme();
  const reduceMotion = useReducedMotion();
  const dark = scheme === 'dark';

  const fly = useSharedValue(0);
  const turn = useSharedValue(0);
  const tie = useSharedValue(0);
  const logoIn = useSharedValue(reduceMotion ? 1 : 0);
  const cinch = useSharedValue(1);
  const reveal = useSharedValue(0);

  useEffect(() => {
    // The timings run even with Reduce Motion on; only the movement is left out
    const always = { reduceMotion: ReduceMotion.Never };
    if (reduceMotion) {
      reveal.value = withDelay(350, withTiming(1, { duration: 200, ...always }));
      const timer = setTimeout(onDone, 580);
      return () => clearTimeout(timer);
    }
    fly.value = withTiming(1, { duration: FLY, easing: Easing.out(Easing.cubic), ...always });
    turn.value = withDelay(
      FLY,
      withTiming(1, { duration: TURN, easing: Easing.inOut(Easing.quad), ...always }),
    );
    tie.value = withDelay(
      TIE_AT,
      withTiming(1, { duration: TIE, easing: Easing.inOut(Easing.quad), ...always }),
    );
    logoIn.value = withDelay(TIE_AT + TIE - 90, withTiming(1, { duration: 120, ...always }));
    cinch.value = withDelay(
      TIE_AT + TIE,
      withSequence(
        withTiming(0.93, { duration: CINCH * 0.4, easing: Easing.out(Easing.quad), ...always }),
        withTiming(1, { duration: CINCH * 0.6, easing: Easing.out(Easing.quad), ...always }),
      ),
    );
    reveal.value = withDelay(
      REVEAL_AT,
      withTiming(1, { duration: REVEAL, easing: Easing.in(Easing.cubic), ...always }),
    );
    const timer = setTimeout(onDone, DONE);
    return () => clearTimeout(timer);
  }, [reduceMotion, onDone, fly, turn, tie, logoIn, cinch, reveal]);

  const backdrop = useAnimatedStyle(() => ({ opacity: 1 - reveal.value }));
  const logo = useAnimatedStyle(() => ({
    opacity: logoIn.value,
    transform: [{ scale: cinch.value * (1 + (reduceMotion ? 0 : reveal.value * 1.6)) }],
  }));
  const ribbons = useAnimatedStyle(() => ({ opacity: 1 - logoIn.value }));

  const colours = dark
    ? { ink: '#FFFFFF', sheen: '#8E8E93' }
    : { ink: '#0A0A0A', sheen: '#6B6B6B' };
  const motion = { fly, turn, tie };

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        StyleSheet.absoluteFill,
        styles.center,
        { backgroundColor: dark ? '#000000' : '#FFFFFF' },
        backdrop,
      ]}
    >
      {!reduceMotion && (
        <Animated.View style={[StyleSheet.absoluteFill, ribbons]}>
          {FRAME_PATHS.map((paths, k) => (
            <TieFrame key={k} index={k} paths={paths} colours={colours} motion={motion} />
          ))}
        </Animated.View>
      )}
      <Animated.View style={logo}>
        <Image source={dark ? RIBBON.white : RIBBON.black} style={styles.image} />
      </Animated.View>
    </Animated.View>
  );
}

/** One still frame of the tie, shown only while it's the current one. */
function TieFrame({
  index,
  paths,
  colours,
  motion,
}: {
  index: number;
  paths: { left: string; right: string };
  colours: Colours;
  motion: Motion;
}) {
  const { tie } = motion;
  const shown = useAnimatedStyle(() => ({
    opacity: Math.round(tie.value * (FRAMES - 1)) === index ? 1 : 0,
  }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, shown]}>
      <RibbonSide d={paths.left} direction={1} loose={index === 0} {...{ colours, motion }} />
      <RibbonSide d={paths.right} direction={-1} loose={index === 0} {...{ colours, motion }} />
    </Animated.View>
  );
}

/**
 * One ribbon of a frame. The loose one also flies in from its side and spins
 * half a turn about the crossing, the two in opposite directions.
 */
function RibbonSide({
  d,
  direction,
  loose,
  colours,
  motion,
}: {
  d: string;
  direction: 1 | -1;
  loose: boolean;
  colours: Colours;
  motion: Motion;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const left = (screenWidth - WIDTH) / 2;
  const top = (screenHeight - HEIGHT) / 2;
  const { fly, turn } = motion;

  const moving = useAnimatedStyle(() =>
    loose
      ? {
          transform: [
            { translateX: (1 - fly.value) * screenWidth * -direction },
            { rotate: `${turn.value * 180 * direction}deg` },
          ],
        }
      : {},
  );

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { transformOrigin: [left + CROSS.x * SCALE, top + CROSS.y * SCALE, 0] },
        moving,
      ]}
    >
      <Svg width={screenWidth} height={screenHeight}>
        <G transform={`translate(${left} ${top}) scale(${SCALE})`}>
          <Path d={d} stroke={colours.ink} strokeWidth={30} strokeLinejoin="round" fill="none" />
          <Path d={d} stroke={colours.sheen} strokeWidth={5} strokeOpacity={0.6} fill="none" />
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  image: { width: WIDTH, height: HEIGHT },
});
