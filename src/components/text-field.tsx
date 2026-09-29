import { useState, type Ref } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText, useTypeStyle } from '@/components/app-text';
import { FieldError } from '@/components/field-error';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';

export type TextFieldType = 'text' | 'name' | 'email' | 'phone' | 'city';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  /** Always shown above the box; placeholders alone disappear once you type. */
  label: string;
  /** One plain sentence under the label, e.g. why we ask. */
  hint?: string;
  /** Shown in red under the box; also read out by screen readers. */
  error?: string;
  /** Picks the keyboard and autofill: email and phone get their own keyboards. */
  type?: TextFieldType;
  ref?: Ref<TextInput>;
  style?: StyleProp<ViewStyle>;
};

const TYPE_PROPS: Record<TextFieldType, TextInputProps> = {
  text: {},
  name: {
    autoComplete: 'name',
    textContentType: 'name',
    autoCapitalize: 'words',
    autoCorrect: false,
  },
  email: {
    autoComplete: 'email',
    textContentType: 'emailAddress',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    autoCorrect: false,
    spellCheck: false,
  },
  phone: {
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
    keyboardType: 'phone-pad',
  },
  city: {
    // Android has its own autofill hint for city; iOS uses textContentType.
    autoComplete: Platform.OS === 'android' ? 'postal-address-locality' : undefined,
    textContentType: 'addressCity',
    autoCapitalize: 'words',
  },
};

/**
 * A labelled text box, 56 tall. The label stays visible above the box, and the
 * box grows with large system text. Pass `ref` to move focus between fields.
 */
export function TextField({
  label,
  hint,
  error,
  type = 'text',
  ref,
  style,
  value,
  multiline,
  onFocus,
  onBlur,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const font = useTypeStyle({ variant: 'bodyLg', text: value ?? '' });

  return (
    <View style={[styles.container, style]}>
      {/* The input carries the label for screen readers, so this copy is hidden from them. */}
      <AppText weight={700} aria-hidden>
        {label}
      </AppText>
      {hint && (
        <AppText color="text2" aria-hidden>
          {hint}
        </AppText>
      )}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={Colors.text2}
        maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        {...TYPE_PROPS[type]}
        {...rest}
        value={value}
        multiline={multiline}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            fontFamily: font.fontFamily,
            fontSize: font.fontSize,
            // A line height on a single-line iOS input misplaces the text, so
            // only multiline boxes get one.
            lineHeight: multiline ? font.lineHeight : undefined,
          },
          multiline && styles.multiline,
          focused && styles.focused,
          !!error && styles.invalid,
        ]}
      />
      {error && <FieldError message={error} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  input: {
    minHeight: Sizes.input,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.button,
    borderWidth: BorderWidth.strong,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  multiline: {
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: Colors.primary,
  },
  invalid: {
    borderColor: Colors.error,
  },
});
