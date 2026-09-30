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
import { Icon } from '@/components/icon';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { selectionHaptic } from '@/lib/haptics';

export type CheckboxProps = Omit<PressableProps, 'children' | 'style' | 'onPress'> & {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Shown in red under the row, e.g. when a required box is left empty. */
  error?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * A round 28-point check (as in Reminders) with its label in one 52-tall row;
 * tapping anywhere on the row toggles it. Used for "I am 18 or older".
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
        onPress={() => {
          selectionHaptic();
          onChange(!checked);
        }}
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
                <Icon name="checkmark" size={17} color={Colors.onPrimary} weight="bold" />
              )}
            </View>
            <AppText
              variant="bodyLg"
              color={disabled ? 'textDisabled' : 'text'}
              style={styles.label}
            >
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
    borderWidth: BorderWidth.control,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  boxInvalid: {
    borderWidth: BorderWidth.strong,
    borderColor: Colors.error,
  },
  boxPressed: {
    backgroundColor: Colors.rowPressed,
  },
  boxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  boxDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.fill,
  },
  label: {
    flex: 1,
  },
});
