import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Locale } from '@/i18n';
import { useLocale } from '@/i18n/locale-context';

const LANGUAGES: { locale: Locale; labelKey: string }[] = [
  { locale: 'en', labelKey: 'profile.english' },
  { locale: 'pa', labelKey: 'profile.punjabi' },
];

export default function ProfileScreen() {
  const { locale, setLocale, t } = useLocale();

  return (
    <Screen style={styles.screen}>
      <AppText variant="title">{t('tabs.profile')}</AppText>

      <AppText variant="heading">{t('profile.language')}</AppText>
      <View style={styles.cards} accessibilityRole="radiogroup">
        {LANGUAGES.map((language) => {
          const selected = language.locale === locale;
          return (
            <Pressable
              key={language.locale}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setLocale(language.locale)}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <AppText variant="heading" lang={language.locale}>
                {t(language.labelKey)}
              </AppText>
              {selected && <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />}
            </Pressable>
          );
        })}
      </View>

      <AppText variant="heading">{t('profile.textSize')}</AppText>
      <AppText color="text2">{t('common.comingSoon')}</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  cards: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
});
