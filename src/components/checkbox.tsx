import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { FieldError } from '@/components/field-error';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';

export type CheckboxProps = Omit<PressableProps, 'children' | 'style' | 'onPress'> & {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Shown in red under the row, e.g. when a required box is left empty. */
  error?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A 28pt box with its label in one 56-tall row; tapping anywhere on the row
 * toggles it. Used for "I am 18 or older".
 */
export function Checkbox({
  label,
  checked,
  onChange,
  error,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: CheckboxProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error}
        accessibilityState={{ checked, disabled: !!disabled }}
        disabled={disabled}
        {...rest}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        {({ pressed }) => (
          <>
            <View
              style={[
                styles.box,
                !!error && styles.boxInvalid,
                pressed && styles.boxPressed,
                checked && styles.boxChecked,
                disabled && styles.boxDisabled,
              ]}
            >
              {checked && (
                <Ionicons name="checkmark-sharp" size={Sizes.iconSmall} color={Colors.onPrimary} />
              )}
            </View>
            <AppText variant="bodyLg" color={disabled ? 'text2' : 'text'} style={styles.label}>
              {label}
            </AppText>
          </>
        )}
      </Pressable>
      {error && <FieldError message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  row: {
    minHeight: Sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  box: {
    width: Sizes.checkbox,
    height: Sizes.checkbox,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.checkbox,
    borderWidth: BorderWidth.strong,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  boxInvalid: {
    borderColor: Colors.error,
  },
  boxPressed: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
  boxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  boxDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.skeleton,
  },
  label: {
    flex: 1,
  },
});
