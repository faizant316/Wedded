import { Pressable, StyleSheet } from 'react-native';

import { Glass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { Colors, Sizes } from '@/constants/theme';

export type GlassButtonProps = {
  icon: IconName;
  /** A full sentence for screen readers, e.g. "Save Royal Orchard". */
  accessibilityLabel: string;
  onPress: () => void;
  /** Icon colour; the app colour by default. */
  color?: string;
  size?: number;
};

/**
 * A round glass button with one icon: iOS 26's toolbar and over-photo button
 * (Close, Share, the heart on a cover photo). 48 across, the minimum target.
 */
export function GlassButton({
  icon,
  accessibilityLabel,
  onPress,
  color = Colors.primary,
  size = Sizes.glassButton,
}: GlassButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={4}
    >
      {({ pressed }) => (
        <Glass
          interactive
          style={[
            styles.circle,
            { width: size, height: size, borderRadius: size / 2 },
            pressed && styles.pressed,
          ]}
        >
          <Icon name={icon} size={Math.round(size * 0.46)} color={color} weight="semibold" />
        </Glass>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
});
