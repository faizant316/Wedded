import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

export default function HomeScreen() {
  const { t } = useLocale();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator>
        <View style={styles.header}>
          <AppText variant="heading" color="primary" weight={800} style={styles.wordmark}>
            {t('app.name')}
          </AppText>
          <LanguageToggle />
        </View>

        <AppText variant="display">{t('home.headline')}</AppText>
        <AppText variant="bodyLg" color="text2">
          {t('home.subtitle')}
        </AppText>

        <AppText variant="heading" style={styles.section}>
          {t('home.browseByEvent')}
        </AppText>
        <View style={styles.placeholderCard}>
          <AppText color="text2">{t('home.eventsPlaceholder')}</AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  wordmark: {
    flexShrink: 1,
  },
  section: {
    marginTop: Spacing.xl,
  },
  placeholderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    minHeight: 96,
    justifyContent: 'center',
  },
});
