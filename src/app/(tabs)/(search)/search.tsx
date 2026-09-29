import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, type TextInput } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { CategoryRow } from '@/components/category-row';
import { CategoryTile } from '@/components/category-tile';
import { Chip } from '@/components/chip';
import { groupIcon } from '@/components/group-icon';
import { Screen } from '@/components/screen';
import { SearchField } from '@/components/search-field';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useCategories } from '@/data/reference';
import { useCategoryVendorCounts } from '@/data/vendors';
import { matchCategories } from '@/features/search/match-categories';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

// "Popular" is the categories with the most published vendors, so it comes
// from the data rather than a list in the app.
const POPULAR_COUNT = 8;

/**
 * S8 Search: type to match categories by English or Punjabi name and their
 * aliases (on the device for now), or pick from Popular or the A to Z grid.
 * Opened from Home's search box with ?focus=1, the keyboard comes up.
 */
export default function SearchScreen() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const categories = useCategories();
  const counts = useCategoryVendorCounts();
  // Two columns stop fitting once the phone's text is very large.
  const columns = useFontScale('heading') >= 1.5 ? 1 : 2;

  useFocusEffect(
    useCallback(() => {
      if (focus) {
        inputRef.current?.focus();
        router.setParams({ focus: undefined });
      }
    }, [focus, router]),
  );

  const openCategory = (slug: string) =>
    router.push({ pathname: '/c/[category]', params: { category: slug } });

  const all = categories.data ?? [];
  const vendorCount = (slug: string) => counts.data?.[slug] ?? 0;
  const matches = matchCategories(all, query);
  const popular = [...all]
    .filter((category) => vendorCount(category.slug) > 0)
    .sort((a, b) => vendorCount(b.slug) - vendorCount(a.slug))
    .slice(0, POPULAR_COUNT);

  let body;
  if (categories.isPending) {
    body = <StateView state="loading" />;
  } else if (categories.isError) {
    body = <StateView state="error" onRetry={() => void categories.refetch()} />;
  } else if (query.trim()) {
    body =
      matches.length > 0 ? (
        <View style={styles.list}>
          {matches.map((category) => (
            <CategoryRow
              key={category.slug}
              name={category.name}
              icon={groupIcon(category.groupSlug)}
              onPress={() => openCategory(category.slug)}
            />
          ))}
        </View>
      ) : (
        <StateView
          state="empty"
          icon="search-outline"
          message={t('search.noMatch', { query: query.trim() })}
        />
      );
  } else {
    const rows = [];
    for (let i = 0; i < all.length; i += columns) {
      rows.push(all.slice(i, i + columns));
    }
    body = (
      <>
        {popular.length > 0 && (
          <>
            <AppText variant="heading" accessibilityRole="header">
              {t('search.popular')}
            </AppText>
            <View style={styles.chips}>
              {popular.map((category) => (
                <Chip
                  key={category.slug}
                  role="button"
                  label={localized(category.name, locale)}
                  onPress={() => openCategory(category.slug)}
                />
              ))}
            </View>
          </>
        )}
        <AppText variant="heading" accessibilityRole="header" style={styles.allTitle}>
          {t('search.allCategories')}
        </AppText>
        <View style={styles.list}>
          {rows.map((row) => (
            <View key={row[0].slug} style={styles.gridRow}>
              {row.map((category) => (
                <CategoryTile
                  key={category.slug}
                  name={category.name}
                  icon={groupIcon(category.groupSlug)}
                  vendorCount={vendorCount(category.slug) || undefined}
                  nearYou={false}
                  onPress={() => openCategory(category.slug)}
                  style={styles.tile}
                />
              ))}
              {row.length < columns && <View style={styles.tile} />}
            </View>
          ))}
        </View>
      </>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <AppText variant="title" accessibilityRole="header">
          {t('tabs.search')}
        </AppText>
        <SearchField ref={inputRef} value={query} onChangeText={setQuery} />
        {body}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  allTitle: {
    marginTop: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tile: {
    flex: 1,
  },
});
