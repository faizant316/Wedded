import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { usePressFeedback } from '@/components/motion';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardProps = Omit<ViewProps, 'style'> & {
  /** Makes the whole card one tap target. Give it an `accessibilityLabel` that
   * says what opening it does, e.g. "Jaago, 9 vendor types". */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * White rounded surface lifted off the cream page by a soft shadow. Grows with
 * its content (never a fixed height) so Punjabi and large text don't clip.
 * Tappable cards shrink a little while held. Pass `style={{ padding: 0 }}` for
 * edge-to-edge photos; the corners clip the photo.
 */
export function Card({ onPress, style, children, ...rest }: CardProps) {
  const press = usePressFeedback();

  if (!onPress) {
    return (
      <View {...rest} style={[styles.card, style]}>
        {children}
      </View>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      {...press.handlers}
      onPress={onPress}
      style={[styles.card, press.pressed && styles.pressed, style, { transform: press.transform }]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    overflow: 'hidden',
    boxShadow: Elevation.card,
  },
  pressed: {
    backgroundColor: Colors.surfacePressed,
  },
});
