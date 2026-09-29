import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { BorderWidth, Colors, Radius, Spacing } from '@/constants/theme';

export type CardProps = Omit<ViewProps, 'style'> & {
  /** Makes the whole card one tap target. Give it an `accessibilityLabel` that
   * says what opening it does, e.g. "Jaago, 9 vendor types". */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * White rounded surface on the cream page. Grows with its content (never a
 * fixed height) so Punjabi and large text don't clip. Pass `style={{ padding: 0 }}`
 * for edge-to-edge photos; the corners clip the photo.
 */
export function Card({ onPress, style, children, ...rest }: CardProps) {
  if (!onPress) {
    return (
      <View {...rest} style={[styles.card, style]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: BorderWidth.hairline,
    borderColor: Colors.border,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: Colors.bg,
    borderColor: Colors.borderInput,
  },
});
