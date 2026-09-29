import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/screen';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

export default function SearchScreen() {
  const { t } = useLocale();

  return (
    <Screen style={styles.screen}>
      <AppText variant="title">{t('tabs.search')}</AppText>
      {/* Placeholder field; the real search opens the keyboard and shows category tiles. */}
      <View style={styles.field} accessibilityRole="search">
        <Ionicons name="search-outline" size={24} color={Colors.text2} />
        <AppText color="text2" style={styles.placeholder}>
          {t('search.placeholder')}
        </AppText>
      </View>
      <AppText color="text2">{t('common.comingSoon')}</AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: Sizes.button,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.button,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  placeholder: {
    flex: 1,
  },
});
