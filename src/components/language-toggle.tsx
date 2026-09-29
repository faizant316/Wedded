import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Colors, Radius, Sizes } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';
import type { Locale } from '@/i18n';

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'EN' },
  { locale: 'pa', label: 'ਪੰ' },
];

/**
 * The EN | ਪੰ pill in the Home header: the fastest way for a mixed household to
 * flip the phone between parent and child.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.pill} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.locale === locale;
        return (
          <Pressable
            key={option.locale}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.locale === 'en' ? 'English' : 'ਪੰਜਾਬੀ'}
            onPress={() => setLocale(option.locale)}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <AppText
              variant="label"
              lang={option.locale}
              color={selected ? 'onPrimary' : 'text'}
              weight={700}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    height: Sizes.tapTarget,
    borderRadius: Radius.chip,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
    padding: 3,
  },
  option: {
    minWidth: 52,
    paddingHorizontal: 12,
    borderRadius: Radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: Colors.primary,
  },
});
