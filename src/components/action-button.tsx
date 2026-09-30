import { Pressable, StyleSheet } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';

export type ActionButtonProps = {
  icon: IconName;
  /** The word under the icon, e.g. "Call". */
  label: string;
  /** A full sentence for screen readers, e.g. "Call Sukhi Dhol Crew, (530) 555-0101". */
  accessibilityLabel: string;
  onPress: () => void;
};

/**
 * One of the profile's contact actions (vision doc S9), shaped like the
 * buttons on an Apple Maps place card: a white tile with the icon in the app
 * colour and its label underneath, so nobody has to guess what an icon means.
 * Several share a row equally.
 */
export function ActionButton({ icon, label, accessibilityLabel, onPress }: ActionButtonProps) {
  const scale = Math.min(useFontScale('label'), 1.4);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Icon name={icon} size={Sizes.icon * scale} color={Colors.primary} weight="medium" />
      <AppText variant="caption" weight={600} color="primary" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: 72,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.photo,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  pressed: {
    backgroundColor: Colors.rowPressed,
  },
  label: {
    textAlign: 'center',
  },
});
