import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { VendorCard } from '@/components/vendor-card';
import { Colors, Spacing } from '@/constants/theme';
import { useCategories, useEvent } from '@/data/reference';
import { useSavedVendors, useSaveVendor } from '@/data/saved';
import { useVendorSearch } from '@/data/search';
import { LocationChip } from '@/features/location/location-chip';
import { useSearchLocation } from '@/features/location/search-location';
import { bilingual, localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

const WIDER_MILES = 50;

/**
 * S6 Results: published vendors in a category, and (with ?event=) only those
 * who serve that event, nearest first from the search location. Without a
 * location they still show, founding vendors first. Deep link:
 * /c/{category}?event={slug}.
 */
export default function ResultsScreen() {
  const { category: categorySlug = '', event: eventSlug } = useLocalSearchParams<{
    category: string;
    event?: string;
  }>();
  const { locale, t } = useLocale();
  const router = useRouter();
  const { place, maxMiles, setMaxMiles } = useSearchLocation();
  const saves = useSavedVendors();
  const { toggleSave } = useSaveVendor();
  const [includeTravelers, setIncludeTravelers] = useState(false);
  const categories = useCategories();
  const event = useEvent(eventSlug ?? '');
  const vendors = useVendorSearch({
    latitude: place?.latitude,
    longitude: place?.longitude,
    maxMiles,
    categorySlug,
    eventSlug,
    includeTravelers,
    limit: 100,
  });
  const [refreshing, setRefreshing] = useState(false);

  // With an event, the heart is for that event; without one, any save counts.
  const savedIds = new Set(
    (saves.data ?? [])
      .filter((save) => eventSlug === undefined || save.eventSlug === eventSlug)
      .map((save) => save.vendorId),
  );

  const category = categories.data?.find((c) => c.slug === categorySlug);
  // While categories load, show no title rather than the raw slug.
  const categoryName = category?.name ?? (categories.isPending ? null : { en: categorySlug });
  const title = categoryName ? bilingual(categoryName, locale) : null;

  async function onRefresh() {
    setRefreshing(true);
    await vendors.refetch();
    setRefreshing(false);
  }

  const header = (
    <View style={styles.header}>
      <BackButton />
      {title && (
        <View>
          <AppText variant="title" lang={title.primary.lang} accessibilityRole="header">
            {title.primary.text}
          </AppText>
          {title.secondary && (
            <AppText color="text2" lang={title.secondary.lang}>
              {title.secondary.text}
            </AppText>
          )}
        </View>
      )}
      {event.data && (
        <AppText variant="bodyLg">
          {t('results.forEvent', { event: localized(event.data.name, locale) })}
        </AppText>
      )}
      <LocationChip />
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
  } else if (place) {
    // Nothing within the distance: offer to look further, or at vendors
    // based further away who still travel here (vision S6 empty states).
    const canWiden = maxMiles !== null && maxMiles < WIDER_MILES;
    empty = (
      <View>
        <StateView
          state="empty"
          icon="location-outline"
          message={
            maxMiles === null
              ? t('results.empty')
              : t('results.emptyNear', { miles: maxMiles, place: place.label })
          }
          action={
            canWiden
              ? {
                  label: t('results.widen', { miles: WIDER_MILES }),
                  onPress: () => setMaxMiles(WIDER_MILES),
                }
              : undefined
          }
        />
        {!includeTravelers && (
          <Button
            variant="text"
            label={t('results.showTravelers')}
            onPress={() => setIncludeTravelers(true)}
          />
        )}
      </View>
    );
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
            category={item.category ?? categoryName ?? { en: categorySlug }}
            city={item.city}
            distanceMiles={item.distanceMiles}
            startingPrice={item.startingPrice}
            foundingNumber={item.foundingNumber}
            travelsToYou={item.withinSearchRadius === false}
            saved={savedIds.has(item.id)}
            onToggleSave={() => toggleSave(item.id, eventSlug)}
            onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: item.slug } })}
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
