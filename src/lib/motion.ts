import {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

import { Springs } from '@/constants/theme';

/**
 * Layout animations for things that appear, go, or move because something
 * else changed (a checklist opening, a ticked row leaving a list). Built on
 * the theme's springs so they feel like the rest of the app, and Reanimated
 * skips them when the phone's Reduce Motion is on.
 */
const { mass, stiffness, damping } = Springs.smooth;

export const Motion = {
  /** Siblings sliding into their new place. */
  layout: LinearTransition.springify().mass(mass).stiffness(stiffness).damping(damping),
  /** Content fading in, e.g. the rows of a checklist that opened. */
  enter: FadeIn.duration(220),
  /** Content fading out. */
  exit: FadeOut.duration(160),
  /** A card arriving on screen: up a little while it fades in. */
  rise: FadeInDown.duration(320),
  /** A checkmark or badge popping in and out. */
  popIn: ZoomIn.springify()
    .mass(Springs.snappy.mass)
    .stiffness(Springs.snappy.stiffness)
    .damping(Springs.snappy.damping),
  popOut: ZoomOut.duration(140),
};
