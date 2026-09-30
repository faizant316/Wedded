import {
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Glass, hasNativeGlass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { selectionHaptic } from '@/lib/haptics';

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

// The capsule is 40 tall; the slop makes the tap target 48.
// Put chips in a wrapping row with at least `Spacing.sm` between rows.
const HIT_SLOP = (Sizes.tapTarget - Sizes.chip) / 2;

/**
 * A capsule: selectable, or a plain button (role 'button'). Grey fill like
 * iOS filter buttons; selected chips fill with the app colour and get a tick,
 * so colour is never the only signal. Picking one gives a light haptic tick.
 * Labels wrap rather than clip.
 */
export function Chip({
  label,
  selected: selectedProp = false,
  role = 'checkbox',
  disabled,
  style,
  accessibilityLabel,
  onPress,
  ...rest
}: ChipProps) {
  const Colors = useColors();
  const styles = useStyles();
  const scale = useFontScale('label');
  const selected = role !== 'button' && selectedProp;

  const a11y = {
    accessibilityRole: role,
    accessibilityLabel: accessibilityLabel ?? label,
    accessibilityState:
      role === 'button'
        ? { disabled: !!disabled }
        : role === 'radio'
          ? { selected, disabled: !!disabled }
          : { checked: selected, disabled: !!disabled },
  } as const;
  const press = (event: GestureResponderEvent) => {
    if (role !== 'button') selectionHaptic();
    onPress?.(event);
  };

  const content = (
    <>
      {selected && (
        <Icon
          name="checkmark"
          size={Sizes.iconSmall * scale * 0.85}
          color={Colors.onPrimary}
          weight="bold"
        />
      )}
      <AppText
        variant="label"
        weight={selected ? 600 : 500}
        color={disabled ? 'textDisabled' : selected ? 'onPrimary' : 'text'}
        style={styles.label}
      >
        {label}
      </AppText>
    </>
  );

  // On iOS 26 a picked chip is tinted Liquid Glass that glows under the finger.
  if (hasNativeGlass && selected && !disabled) {
    return (
      <PressableScale
        {...a11y}
        disabled={disabled}
        hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
        pressedScale={0.94}
        {...rest}
        onPress={press}
        style={[styles.wrap, style]}
      >
        <Glass interactive tinted style={styles.shape}>
          {content}
        </Glass>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      {...a11y}
      disabled={disabled}
      hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
      pressedScale={0.94}
      {...rest}
      onPress={press}
      style={[
        styles.wrap,
        styles.shape,
        styles.chip,
        selected && styles.selected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </PressableScale>
  );
}

const useStyles = makeStyles((Colors) => ({
  wrap: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  shape: {
    minHeight: Sizes.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.chip,
  },
  chip: {
    backgroundColor: Colors.surface,
    boxShadow: `inset 0 0 0 1px ${Colors.border}`,
  },
  selected: {
    backgroundColor: Colors.primaryFill,
    boxShadow: 'none',
  },
  disabled: {
    backgroundColor: Colors.fill,
    boxShadow: 'none',
  },
  label: {
    flexShrink: 1,
  },
}));
