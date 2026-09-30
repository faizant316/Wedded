import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useFontScale } from '@/components/app-text';
import { CategoryRow } from '@/components/category-row';
import { groupIcon } from '@/components/group-icon';
import { LanguageToggle } from '@/components/language-toggle';
import { ListRow, ListSection, SectionTitle } from '@/components/list';
import { NavScreen } from '@/components/nav';
import { SearchButton } from '@/components/search-button';
import { StateView } from '@/components/state-view';
import { TypeTile } from '@/components/type-tile';
import { Spacing, useColors } from '@/constants/theme';
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

// Tiles appear one after another, quickly (Reduce Motion turns this off).
const STAGGER_MS = 45;

/**
 * S4 Home, kept simple on purpose (DECISIONS 2026-09-30): the search bar,
 * "What do you need?" as big tiles for each kind of vendor, then the events
 * as a planning list. Vendor types come first because every vendor has a type
 * but not every vendor lists the events they serve.
 */
export default function HomeScreen() {
  const Colors = useColors();
  const { t } = useLocale();
  const router = useRouter();
  const groups = useCategoryGroups();
  const { data: sections, status, refetch } = useHomeEvents();
  const [refreshing, setRefreshing] = useState(false);
  // Two tiles side by side stop fitting once the phone's text is very large.
  const columns = useFontScale('body') >= 1.5 ? 1 : 2;

  // Pull to refresh fetches again even though events are cached for a day.
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([groups.refetch(), refetch()]);
    setRefreshing(false);
  }

  const openSearch = () => router.push('/search');
  const startTyping = () => router.push({ pathname: '/search', params: { focus: '1' } });

  const tiles = groups.data ?? [];
  const rows = [];
  for (let i = 0; i < tiles.length; i += columns) rows.push(tiles.slice(i, i + columns));

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
      <View style={styles.find}>
        <SearchButton onPress={startTyping} />
        <LocationChip />
      </View>

      <View style={styles.block}>
        <SectionTitle>{t('home.whatDoYouNeed')}</SectionTitle>
        {groups.isPending && <StateView state="loading" />}
        {groups.isError && <StateView state="error" onRetry={() => void groups.refetch()} />}
        {rows.map((row, r) => (
          <View key={row[0].slug} style={styles.row}>
            {row.map((group, c) => (
              <Animated.View
                key={group.slug}
                entering={FadeInDown.delay((r * columns + c) * STAGGER_MS).springify()}
                style={styles.cell}
              >
                <TypeTile
                  name={group.name}
                  icon={groupIcon(group.slug)}
                  onPress={() =>
                    router.push({ pathname: '/g/[group]', params: { group: group.slug } })
                  }
                  style={styles.fill}
                />
              </Animated.View>
            ))}
            {row.length < columns && <View style={styles.cell} />}
          </View>
        ))}
        {groups.data && (
          <ListSection inset>
            <ListRow
              title={t('home.allTypes')}
              icon="grid-outline"
              tone="primary"
              chevron
              onPress={openSearch}
            />
          </ListSection>
        )}
      </View>

      <View style={styles.block}>
        <SectionTitle>{t('home.planByEvent')}</SectionTitle>
        {status === 'pending' && <StateView state="loading" />}
        {status === 'error' && <StateView state="error" onRetry={() => void refetch()} />}
        {status === 'success' && sections.length === 0 && (
          <StateView state="empty" icon="calendar-outline" message={t('home.empty')} />
        )}
        {sections?.map((section) => {
          const heading = PHASE_HEADINGS[section.phase];
          return (
            <ListSection key={section.phase} header={heading ? t(heading) : undefined}>
              {section.events.map((event) => (
                <CategoryRow
                  key={event.slug}
                  name={event.name}
                  icon={null}
                  detail={t('counts.vendors', { count: event.vendorCount })}
                  onPress={() =>
                    router.push({ pathname: '/e/[slug]', params: { slug: event.slug } })
                  }
                />
              ))}
            </ListSection>
          );
        })}
      </View>
    </NavScreen>
  );
}

const styles = StyleSheet.create({
  find: {
    gap: Spacing.md,
  },
  block: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cell: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
});
