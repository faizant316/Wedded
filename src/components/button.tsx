import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Glass, hasNativeGlass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { type ColorToken, makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style' | 'disabled'> & {
  label: string;
  /** primary: the one main action on a screen, a filled capsule. secondary: a
   * tinted capsule (iOS "bordered"). text: a plain link-style action.
   * danger: red, for actions that can't be undone (delete account). */
  variant?: ButtonVariant;
  /** Optional icon before the label. */
  icon?: IconName;
  /** Shows a spinner and ignores taps, e.g. while sending. */
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const LABEL_COLOR: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  secondary: 'primary',
  text: 'primary',
  danger: 'onPrimary',
};

/**
 * The app's button, an iOS 26 capsule at least 48 tall that stretches to the
 * width of its container, and lets long (Punjabi) labels wrap onto a second
 * line instead of clipping. On iOS 26 it's Liquid Glass that glows under the
 * finger (tinted for the main action, clear for secondary), inside a spring
 * press (DECISIONS 2026-09-30); elsewhere it's a solid capsule.
 */
export function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const Colors = useColors();
  const styles = useStyles();
  const pressedStyles = usePressedStyles();
  const labelColor: ColorToken = disabled ? 'textDisabled' : LABEL_COLOR[variant];
  const scale = useFontScale('button');
  const off = disabled || loading;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={Colors[labelColor]} />
      ) : (
        icon && (
          <Icon
            name={icon}
            size={Sizes.iconSmall * scale}
            color={Colors[labelColor]}
            weight="semibold"
          />
        )
      )}
      <AppText variant="button" color={labelColor} style={styles.label}>
        {label}
      </AppText>
    </>
  );

  if (hasNativeGlass && variant !== 'text' && !disabled) {
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: off, busy: loading }}
        disabled={off}
        pressedScale={0.96}
        {...rest}
        style={style}
      >
        <Glass
          interactive
          tinted={variant === 'primary'}
          tintColor={variant === 'danger' ? Colors.errorFill : undefined}
          style={styles.base}
        >
          {content}
        </Glass>
      </PressableScale>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && pressedStyles[variant],
        disabled && variant !== 'text' && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = makeStyles((Colors) => ({
  base: {
    minHeight: Sizes.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.button,
  },
  primary: {
    backgroundColor: Colors.primaryFill,
  },
  secondary: {
    backgroundColor: Colors.primaryTint,
  },
  text: {
    paddingHorizontal: Spacing.lg,
  },
  danger: {
    backgroundColor: Colors.errorFill,
  },
  disabled: {
    backgroundColor: Colors.fill,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
}));

const usePressedStyles = makeStyles((Colors) => ({
  primary: {
    backgroundColor: Colors.primaryFillPressed,
  },
  secondary: {
    backgroundColor: Colors.fillPressed,
  },
  text: {
    opacity: 0.5,
  },
  danger: {
    backgroundColor: Colors.errorFillPressed,
  },
}));
