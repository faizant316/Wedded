import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { VendorCard } from '@/components/vendor-card';
import { Colors, Spacing } from '@/constants/theme';
import { useCategories, useEvent } from '@/data/reference';
import { useVendorsFor } from '@/data/vendors';
import { bilingual, localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * S6 Results: published vendors in a category, and (with ?event=) only those
 * who serve that event. Deep link: /c/{category}?event={slug}. Not sorted by
 * distance yet: founding vendors first, then A to Z.
 */
export default function ResultsScreen() {
  const { category: categorySlug = '', event: eventSlug } = useLocalSearchParams<{
    category: string;
    event?: string;
  }>();
  const { locale, t } = useLocale();
  const categories = useCategories();
  const event = useEvent(eventSlug ?? '');
  const vendors = useVendorsFor(categorySlug, eventSlug);
  const [refreshing, setRefreshing] = useState(false);

  const category = categories.data?.find((c) => c.slug === categorySlug);
  const categoryName = category?.name ?? { en: categorySlug };
  const { primary, secondary } = bilingual(categoryName, locale);

  async function onRefresh() {
    setRefreshing(true);
    await vendors.refetch();
    setRefreshing(false);
  }

  const header = (
    <View style={styles.header}>
      <BackButton />
      <View>
        <AppText variant="title" lang={primary.lang} accessibilityRole="header">
          {primary.text}
        </AppText>
        {secondary && (
          <AppText color="text2" lang={secondary.lang}>
            {secondary.text}
          </AppText>
        )}
      </View>
      {event.data && (
        <AppText variant="bodyLg">
          {t('results.forEvent', { event: localized(event.data.name, locale) })}
        </AppText>
      )}
      {vendors.isSuccess && vendors.data.length > 0 && (
        <AppText variant="label" color="text2">
          {t('counts.vendors', { count: vendors.data.length })}
        </AppText>
      )}
    </View>
  );

  let empty;
  if (vendors.isPending) {
    empty = <StateView state="loading" />;
  } else if (vendors.isError) {
    empty = <StateView state="error" onRetry={() => void vendors.refetch()} />;
  } else {
    empty = <StateView state="empty" icon="people-outline" message={t('results.empty')} />;
  }

  return (
    <Screen>
      <FlatList
        data={vendors.data ?? []}
        keyExtractor={(vendor) => vendor.id}
        renderItem={({ item }) => (
          <VendorCard
            name={item.name}
            category={categoryName}
            city={item.city}
            startingPrice={item.startingPrice}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
  },
});
