import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Screen } from '@/components/screen';
import { Colors, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

export default function SavedScreen() {
  const { t } = useLocale();

  return (
    <Screen style={styles.screen}>
      <AppText variant="title">{t('tabs.saved')}</AppText>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={56} color={Colors.accent} />
        <AppText color="text2" style={styles.emptyText}>
          {t('saved.empty')}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  emptyText: {
    textAlign: 'center',
  },
});
