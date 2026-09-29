import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { usePressFeedback } from '@/components/motion';
import {
  BorderWidth,
  Colors,
  Elevation,
  gradient,
  Gradients,
  noGradient,
  Radius,
  Sizes,
  Spacing,
  type ColorToken,
} from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const labelColor: ColorToken = disabled ? 'text2' : LABEL_COLOR[variant];
  const scale = useFontScale('button');
  const press = usePressFeedback(onPressIn, onPressOut);
  const off = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: off, busy: loading }}
      disabled={off}
      {...rest}
      {...press.handlers}
      style={[
        styles.base,
        styles[variant],
        press.pressed && pressedStyles[variant],
        disabled && variant !== 'text' && styles.disabled,
        style,
        { transform: press.transform },
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
    </AnimatedPressable>
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
    ...gradient(Gradients.primary),
    boxShadow: Elevation.button,
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
    ...noGradient,
    boxShadow: 'none',
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
});

const pressedStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primaryPressed,
    ...noGradient,
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
