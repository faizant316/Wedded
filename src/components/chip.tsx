import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import {
  BorderWidth,
  Colors,
  gradient,
  Gradients,
  Radius,
  Sizes,
  Spacing,
} from '@/constants/theme';

export type ChipProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  /** Ignored for role 'button'. */
  selected?: boolean;
  /** 'checkbox' when several chips in a row can be on (the default); 'radio'
   * when picking one turns the others off; 'button' when the chip goes
   * somewhere instead of toggling. Screen readers announce the difference. */
  role?: 'checkbox' | 'radio' | 'button';
  style?: StyleProp<ViewStyle>;
};

// The pill is 44 tall to match the design; the slop makes the tap target 48.
// Put chips in a wrapping row with at least `Spacing.sm` between rows.
const HIT_SLOP = (Sizes.tapTarget - Sizes.chip) / 2;

/**
 * A pill: selectable, or a plain button (role 'button'). Selected chips get a
 * tick as well as a colour change, so colour is never the only signal. Labels
 * wrap rather than clip.
 */
export function Chip({
  label,
  selected: selectedProp = false,
  role = 'checkbox',
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ChipProps) {
  const scale = useFontScale('label');
  const selected = role !== 'button' && selectedProp;

  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={
        role === 'button'
          ? { disabled: !!disabled }
          : role === 'radio'
            ? { selected, disabled: !!disabled }
            : { checked: selected, disabled: !!disabled }
      }
      disabled={disabled}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
      {...rest}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressed,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {selected && (
        <Ionicons name="checkmark" size={Sizes.iconSmall * scale} color={Colors.onPrimary} />
      )}
      <AppText
        variant="label"
        color={disabled ? 'text2' : selected ? 'onPrimary' : 'text'}
        style={styles.label}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: Sizes.chip,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.chip,
    borderWidth: BorderWidth.control,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    ...gradient(Gradients.primary),
  },
  pressed: {
    backgroundColor: Colors.primaryTint,
  },
  disabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.skeleton,
  },
  label: {
    flexShrink: 1,
  },
});
