import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useFontScale, useTypeStyle } from '@/components/app-text';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

export type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  ref?: Ref<TextInput>;
};

/** The Search tab's text box: 56 tall, with a clear button once there's text. */
export function SearchField({ value, onChangeText, ref }: SearchFieldProps) {
  const { t } = useLocale();
  const scale = useFontScale('bodyLg');
  const font = useTypeStyle({ variant: 'bodyLg', text: value });
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, focused && styles.focused]}>
      <Ionicons name="search-outline" size={Sizes.icon * scale} color={Colors.text2} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('search.placeholder')}
        placeholderTextColor={Colors.text2}
        accessibilityLabel={t('search.label')}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        maxFontSizeMultiplier={font.maxFontSizeMultiplier}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, { fontFamily: font.fontFamily, fontSize: font.fontSize }]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.clear')}
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Ionicons name="close-circle" size={Sizes.icon * scale} color={Colors.text2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: Sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.lg,
    borderRadius: Radius.button,
    borderWidth: BorderWidth.strong,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  focused: {
    borderColor: Colors.primary,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
  },
  clear: {
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
