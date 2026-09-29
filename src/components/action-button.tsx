import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type ActionButtonProps = {
  icon: IoniconName;
  /** The word under the circle, e.g. "Call". */
  label: string;
  /** A full sentence for screen readers, e.g. "Call Sukhi Dhol Crew, (530) 555-0101". */
  accessibilityLabel: string;
  onPress: () => void;
};

/**
 * One of the profile's contact actions (vision doc S9): an icon in a circle
 * with its label underneath, so nobody has to guess what an icon means.
 */
export function ActionButton({ icon, label, accessibilityLabel, onPress }: ActionButtonProps) {
  const scale = useFontScale('label');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={styles.button}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.circle, pressed && styles.pressed]}>
            <Ionicons name={icon} size={Sizes.icon * scale} color={Colors.primary} />
          </View>
          <AppText variant="label" style={styles.label}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: Sizes.iconCircle + Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  circle: {
    width: Sizes.iconCircle,
    height: Sizes.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Colors.primaryTint,
  },
  pressed: {
    backgroundColor: Colors.skeleton,
  },
  label: {
    textAlign: 'center',
  },
});
