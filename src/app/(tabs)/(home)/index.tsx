import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Button } from '@/components/button';
import { CategoryRow } from '@/components/category-row';
import { EventTile } from '@/components/event-tile';
import { groupIcon } from '@/components/group-icon';
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { SearchButton } from '@/components/search-button';
import { StateView } from '@/components/state-view';
import { Colors, Elevation, gradient, Gradients, Radius, Spacing } from '@/constants/theme';
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
 * S4 Home. Vendor types come first (Venues, Food, Music...), because every
 * vendor has a type but not every vendor lists the events they serve. Events
 * follow as a planning checklist, in ceremony order, grouped by phase.
 */
export default function HomeScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const groups = useCategoryGroups();
  const { data: sections, status, refetch } = useHomeEvents();
  const [refreshing, setRefreshing] = useState(false);
  // At very large text the tagline alone fills the first screen, so it steps
  // aside and location and search stay at the top.
  const showTagline = useFontScale('title') < 1.5;

  // Pull to refresh fetches again even though events are cached for a day.
  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([groups.refetch(), refetch()]);
    setRefreshing(false);
  }

  const openSearch = () => router.navigate('/search');
  const startTyping = () => router.navigate({ pathname: '/search', params: { focus: '1' } });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <View style={styles.hero}>
          <View style={styles.header}>
            <AppText variant="heading" color="onPrimary" weight={800} style={styles.wordmark}>
              {t('app.name')}
            </AppText>
            <LanguageToggle />
          </View>
          {showTagline && (
            <View style={styles.headline}>
              <AppText variant="title" color="onPrimary">
                {t('home.headline')}
              </AppText>
              <AppText color="onPrimary2">{t('home.subtitle')}</AppText>
            </View>
          )}
          <LocationChip />
          <SearchButton onPress={startTyping} />
          {/* The thin phulkari stripe under the header (vision §4). */}
          <View style={styles.stripe} />
        </View>

        <AppText variant="title" accessibilityRole="header" style={styles.browse}>
          {t('home.browseByType')}
        </AppText>
        {groups.isPending && <StateView state="loading" />}
        {groups.isError && <StateView state="error" onRetry={() => void groups.refetch()} />}
        {groups.data && (
          <View style={styles.section}>
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
            <Button variant="text" label={t('home.allCategories')} onPress={openSearch} />
          </View>
        )}

        <AppText variant="title" accessibilityRole="header" style={styles.browse}>
          {t('home.planByEvent')}
        </AppText>

        {status === 'pending' && <StateView state="loading" />}
        {status === 'error' && <StateView state="error" onRetry={() => void refetch()} />}
        {status === 'success' && sections.length === 0 && (
          <StateView state="empty" icon="calendar-outline" message={t('home.empty')} />
        )}

        {sections?.map((section) => {
          const heading = PHASE_HEADINGS[section.phase];
          return (
            <View key={section.phase} style={styles.section}>
              {heading && (
                <AppText variant="heading" accessibilityRole="header">
                  {t(heading)}
                </AppText>
              )}
              {section.events.map((event) => (
                <EventTile
                  key={event.slug}
                  name={event.name}
                  vendorTypeCount={event.vendorTypeCount}
                  vendorCount={event.vendorCount}
                  onPress={() =>
                    router.push({ pathname: '/e/[slug]', params: { slug: event.slug } })
                  }
                />
              ))}
            </View>
          );
        })}

        {status === 'success' && sections.length > 0 && (
          <Button
            variant="text"
            icon="ribbon-outline"
            label={t('home.foundingWall')}
            onPress={() => router.push('/founding')}
          />
        )}
        {status === 'success' && sections.length > 0 && (
          <Button
            variant="text"
            icon="storefront-outline"
            label={t('home.forVendors')}
            onPress={() => router.push('/for-vendors')}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  hero: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderRadius: Radius.sheet,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    ...gradient(Gradients.hero),
    boxShadow: Elevation.raised,
  },
  headline: {
    gap: Spacing.xs,
  },
  stripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Spacing.xs,
    ...gradient(Gradients.phulkari),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  wordmark: {
    flexShrink: 1,
  },
  browse: {
    marginTop: Spacing.sm,
  },
  section: {
    gap: Spacing.md,
  },
});
