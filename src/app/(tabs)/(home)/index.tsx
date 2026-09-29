import { useRouter } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { EventTile } from '@/components/event-tile';
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { SearchButton } from '@/components/search-button';
import { StateView } from '@/components/state-view';
import { Colors, Spacing } from '@/constants/theme';
import { useHomeEvents } from '@/data/reference';
import { LocationChip } from '@/features/location/location-chip';
import { useLocale } from '@/i18n/locale-context';

// Headings for the phases in culture_events. "whole_wedding" (and any phase
// added later) has no heading: its cards follow the last section.
const PHASE_HEADINGS: Partial<Record<string, string>> = {
  before: 'home.phases.before',
  wedding_day: 'home.phases.weddingDay',
  after: 'home.phases.after',
};

/** S4 Home: the wedding's events in ceremony order, grouped by phase. */
export default function HomeScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const { data: sections, status, refetch } = useHomeEvents();
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh fetches again even though events are cached for a day.
  async function onRefresh() {
    setRefreshing(true);
    await refetch();
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
        <View style={styles.header}>
          <AppText variant="heading" color="primary" weight={800} style={styles.wordmark}>
            {t('app.name')}
          </AppText>
          <LanguageToggle />
        </View>

        <LocationChip />
        <SearchButton onPress={startTyping} />

        <AppText variant="title" accessibilityRole="header" style={styles.browse}>
          {t('home.browseByEvent')}
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
          <>
            <Button variant="text" label={t('home.allCategories')} onPress={openSearch} />
            <Button
              variant="text"
              icon="ribbon-outline"
              label={t('home.foundingWall')}
              onPress={() => router.push('/founding')}
            />
          </>
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
