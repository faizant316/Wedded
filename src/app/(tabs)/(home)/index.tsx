import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { CategoryRow } from '@/components/category-row';
import { groupIcon } from '@/components/group-icon';
import { LanguageToggle } from '@/components/language-toggle';
import { ListRow, ListSection, SectionTitle } from '@/components/list';
import { NavScreen } from '@/components/nav';
import { SearchButton } from '@/components/search-button';
import { StateView } from '@/components/state-view';
import { StoriesRow } from '@/components/stories-row';
import { VendorShelf } from '@/components/vendor-shelf';
import { WeddingCard } from '@/components/wedding-card';
import { Spacing, useColors } from '@/constants/theme';
import { useFeed } from '@/data/feed';
import { useCategoryGroups, useHomeEvents } from '@/data/reference';
import { LocationChip } from '@/features/location/location-chip';
import { useLocale } from '@/i18n/locale-context';

// Headings for the phases in culture_events. "whole_wedding" (and any phase
// added later) has no heading: its cards follow the last section.
const PHASE_HEADINGS: Partial<Record<string, string>> = {
  before: 'home.phases.before',
  wedding_day: 'home.phases.weddingDay',
  after: 'home.phases.after',
};

/**
 * S4 Home, laid out like a planning app rather than a feed: the family's
 * wedding first (the countdown and the next things to book), then search,
 * then vendor types (Venues, Food, Music...), because every vendor has a
 * type but not every vendor lists the events they serve. Real weddings and
 * founding vendors follow, then events as a checklist in ceremony order,
 * grouped by phase. A large title with the language switch in the bar, then
 * inset-grouped lists, like an iOS app's first tab.
 */
export default function HomeScreen() {
  const Colors = useColors();
  const { t } = useLocale();
  const router = useRouter();
  const groups = useCategoryGroups();
  const { data: sections, status, refetch } = useHomeEvents();
  const feed = useFeed();
  const [refreshing, setRefreshing] = useState(false);
  const posts = feed.data ?? [];
  const founding = posts.filter((post) => post.foundingNumber != null);

  // Pull to refresh fetches again even though events are cached for a day.
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([groups.refetch(), refetch(), feed.refetch()]);
    setRefreshing(false);
  }

  const openSearch = () => router.navigate('/search');
  const startTyping = () => router.navigate({ pathname: '/search', params: { focus: '1' } });

  return (
    <NavScreen
      title={t('app.name')}
      back={false}
      trailing={<LanguageToggle />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.chevron}
          colors={[Colors.primary]}
        />
      }
    >
      <WeddingCard />

      <View style={styles.find}>
        <SearchButton onPress={startTyping} />
        <LocationChip />
      </View>

      <View style={styles.block}>
        <SectionTitle>{t('home.browseByType')}</SectionTitle>
        {groups.isPending && <StateView state="loading" />}
        {groups.isError && <StateView state="error" onRetry={() => void groups.refetch()} />}
        {groups.data && (
          <ListSection inset>
            {groups.data.map((group) => (
              <CategoryRow
                key={group.slug}
                name={group.name}
                icon={groupIcon(group.slug)}
                onPress={() =>
                  router.push({ pathname: '/g/[group]', params: { group: group.slug } })
                }
              />
            ))}
            <ListRow
              title={t('home.allCategories')}
              icon="grid-outline"
              tone="primary"
              chevron
              onPress={openSearch}
            />
          </ListSection>
        )}
      </View>

      {posts.length > 0 && (
        <View style={styles.block}>
          <SectionTitle>{t('home.watchStories')}</SectionTitle>
          <StoriesRow posts={posts} />
        </View>
      )}

      {founding.length > 0 && (
        <View style={styles.block}>
          <View style={styles.titleRow}>
            <SectionTitle>{t('home.featured')}</SectionTitle>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/founding')}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <AppText weight={500} color="primary">
                {t('home.seeAll')}
              </AppText>
            </Pressable>
          </View>
          <VendorShelf posts={founding} />
        </View>
      )}

      <View style={styles.block}>
        <SectionTitle>{t('home.planByEvent')}</SectionTitle>
        {status === 'pending' && <StateView state="loading" />}
        {status === 'error' && <StateView state="error" onRetry={() => void refetch()} />}
        {status === 'success' && sections.length === 0 && (
          <StateView state="empty" icon="calendar-outline" message={t('home.empty')} />
        )}
        {sections?.map((section) => {
          // Main events only; the rest are a tap away in My Wedding.
          const main = section.events.filter((event) => event.isCore);
          if (main.length === 0) return null;
          const heading = PHASE_HEADINGS[section.phase];
          return (
            <ListSection key={section.phase} header={heading ? t(heading) : undefined}>
              {main.map((event) => (
                <CategoryRow
                  key={event.slug}
                  name={event.name}
                  icon={null}
                  detail={[
                    t('counts.vendorTypes', { count: event.vendorTypeCount }),
                    t('counts.vendors', { count: event.vendorCount }),
                  ].join(' · ')}
                  onPress={() =>
                    router.push({ pathname: '/e/[slug]', params: { slug: event.slug } })
                  }
                />
              ))}
            </ListSection>
          );
        })}
      </View>

      {status === 'success' && sections.length > 0 && (
        <ListSection inset>
          <ListRow
            title={t('home.foundingWall')}
            icon="ribbon-outline"
            iconColor="kesari"
            onPress={() => router.push('/founding')}
          />
          <ListRow
            title={t('home.forVendors')}
            icon="storefront-outline"
            onPress={() => router.push('/for-vendors')}
          />
        </ListSection>
      )}
    </NavScreen>
  );
}

const styles = StyleSheet.create({
  find: {
    gap: Spacing.md,
  },
  block: {
    gap: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingRight: Spacing.xs,
  },
  pressed: {
    opacity: 0.5,
  },
});
