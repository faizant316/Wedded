import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { BorderWidth, Colors, Radius, Sizes, Spacing, type ColorToken } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style' | 'disabled'> & {
  label: string;
  /** primary: the one main action on a screen. secondary: outlined. text: a link-style action.
   * danger: red, for actions that can't be undone (delete account). */
  variant?: ButtonVariant;
  /** Optional icon before the label. */
  icon?: IoniconName;
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
 * The app's button: at least 56 tall, stretches to the width of its container,
 * and lets long (Punjabi) labels wrap onto a second line instead of clipping.
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
  const labelColor: ColorToken = disabled ? 'text2' : LABEL_COLOR[variant];
  const scale = useFontScale('button');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && pressedStyles[variant],
        disabled && variant !== 'text' && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors[labelColor]} />
      ) : (
        icon && <Ionicons name={icon} size={Sizes.icon * scale} color={Colors[labelColor]} />
      )}
      <AppText variant="button" color={labelColor} style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.strong,
    borderColor: Colors.primary,
  },
  text: {
    paddingHorizontal: Spacing.lg,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  disabled: {
    backgroundColor: Colors.skeleton,
    borderColor: Colors.skeleton,
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primaryPressed,
  },
  secondary: {
    backgroundColor: Colors.primaryTint,
  },
  text: {
    backgroundColor: Colors.primaryTint,
  },
  danger: {
    backgroundColor: Colors.errorPressed,
  },
});
