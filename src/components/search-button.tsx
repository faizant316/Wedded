import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

/**
 * Looks like a search box, acts as a button: tapping it opens the Search tab
 * (vision doc S4). The real text field lives on the Search screen.
 */
export function SearchButton({ onPress }: { onPress: () => void }) {
  const { t } = useLocale();
  const scale = useFontScale('bodyLg');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('search.placeholder')}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}
    >
      <Ionicons name="search-outline" size={Sizes.icon * scale} color={Colors.text2} />
      <AppText variant="bodyLg" color="text2" style={styles.label}>
        {t('search.placeholder')}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: Sizes.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.button,
    borderWidth: BorderWidth.strong,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  pressed: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
  label: {
    flex: 1,
  },
});
