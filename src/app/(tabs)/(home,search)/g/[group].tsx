import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { CategoryRow } from '@/components/category-row';
import { groupIcon } from '@/components/group-icon';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useCategoryGroups } from '@/data/reference';
import { bilingual } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * One group of vendor types (Venues, Music...) and the types in it; each opens
 * the vendor list for that type. Deep link: /g/{group}.
 */
export default function GroupScreen() {
  const { group: groupSlug = '' } = useLocalSearchParams<{ group: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const groups = useCategoryGroups();
  const group = groups.data?.find((g) => g.slug === groupSlug);

  let body;
  if (groups.isPending) {
    body = <StateView state="loading" />;
  } else if (groups.isError) {
    body = <StateView state="error" onRetry={() => void groups.refetch()} />;
  } else if (!group) {
    body = (
      <StateView
        state="empty"
        icon="grid-outline"
        message={t('group.notFound')}
        action={{ label: t('common.goHome'), onPress: () => router.navigate('/') }}
      />
    );
  } else {
    const { primary, secondary } = bilingual(group.name, locale);
    body = (
      <>
        <View>
          <AppText variant="display" lang={primary.lang} accessibilityRole="header">
            {primary.text}
          </AppText>
          {secondary && (
            <AppText variant="bodyLg" color="text2" lang={secondary.lang}>
              {secondary.text}
            </AppText>
          )}
        </View>
        <View style={styles.list}>
          {group.categories.map((category) => (
            <CategoryRow
              key={category.slug}
              name={category.name}
              icon={groupIcon(group.slug)}
              onPress={() =>
                router.push({ pathname: '/c/[category]', params: { category: category.slug } })
              }
            />
          ))}
        </View>
      </>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton />
        {body}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  list: {
    gap: Spacing.sm,
  },
});
