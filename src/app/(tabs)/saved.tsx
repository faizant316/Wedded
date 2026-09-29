import { router, type Href } from 'expo-router';
import { SectionList, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { VendorCard } from '@/components/vendor-card';
import { Spacing } from '@/constants/theme';
import { useHomeEvents } from '@/data/reference';
import { useSavedVendors, useSaveVendor, type SavedVendor } from '@/data/saved';
import { useSession } from '@/features/auth/session';
import { localized, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

type Section = { key: string; title: LocalizedText; data: SavedVendor[] };

/**
 * Saved (vision S15): everything the family saved, grouped by event in
 * ceremony order, then "Not sure yet". Saving needs an account; logged out,
 * this tab explains that and offers sign-in.
 */
export default function SavedScreen() {
  const { t, locale } = useLocale();
  const { status, requireSignIn } = useSession();
  const saved = useSavedVendors();
  const events = useHomeEvents();
  const { removeSave } = useSaveVendor();

  let body;
  if (status === 'signedOut' || status === 'needsProfile') {
    body = (
      <StateView
        state="empty"
        icon="heart-outline"
        message={t('saved.signInToSee')}
        action={{ label: t('profile.account.signIn'), onPress: () => requireSignIn() }}
      />
    );
  } else if (status === 'loading' || saved.isPending || events.isPending) {
    body = <StateView state="loading" />;
  } else if (status === 'error' || saved.isError || events.isError) {
    body = (
      <StateView
        state="error"
        onRetry={() => {
          void saved.refetch();
          void events.refetch();
        }}
      />
    );
  } else if (saved.data.length === 0) {
    body = <StateView state="empty" icon="heart-outline" message={t('saved.empty')} />;
  } else {
    const sections = groupByEvent(
      saved.data,
      events.data.flatMap((section) => section.events),
      t('saved.notSure'),
    );
    body = (
      <SectionList
        sections={sections}
        keyExtractor={(save) => save.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <AppText color="text2">{t('saved.count', { count: saved.data.length })}</AppText>
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="heading" accessibilityRole="header" style={styles.sectionHeader}>
            {localized(section.title, locale)}
          </AppText>
        )}
        renderItem={({ item }) => <SavedItem save={item} onRemove={() => removeSave(item.id)} />}
        onRefresh={() => void saved.refetch()}
        refreshing={saved.isRefetching}
      />
    );
  }

  return (
    <Screen style={styles.screen}>
      <AppText variant="title" accessibilityRole="header">
        {t('tabs.saved')}
      </AppText>
      {body}
    </Screen>
  );
}

function SavedItem({ save, onRemove }: { save: SavedVendor; onRemove: () => void }) {
  const { t, locale } = useLocale();
  const { vendor } = save;

  return (
    <View style={styles.item}>
      {vendor ? (
        <VendorCard
          name={vendor.name}
          category={vendor.category ?? { en: '' }}
          city={vendor.city}
          startingPrice={vendor.startingPrice}
          // The vendor profile route (/v/{slug}, vision S9) is being built
          // alongside this; until it lands this opens the not-found screen.
          onPress={() => router.push(`/v/${vendor.slug}` as Href)}
        />
      ) : (
        <Card>
          <AppText color="text2">{t('saved.noLongerListed')}</AppText>
        </Card>
      )}
      <Button
        variant="text"
        icon="heart-dislike-outline"
        label={t('saved.remove')}
        accessibilityLabel={
          vendor
            ? t('saved.removeNamed', { name: localized(vendor.name, locale) })
            : t('saved.remove')
        }
        onPress={onRemove}
      />
    </View>
  );
}

/** Saves grouped by event in ceremony order, then "Not sure yet" last. */
function groupByEvent(
  saves: SavedVendor[],
  orderedEvents: { slug: string; name: LocalizedText }[],
  notSureLabel: string,
): Section[] {
  const sections: Section[] = [];
  for (const event of orderedEvents) {
    const data = saves.filter((save) => save.eventSlug === event.slug);
    if (data.length > 0) sections.push({ key: event.slug, title: event.name, data });
  }
  // Saves for events outside the default culture's list, just in case.
  const known = new Set(orderedEvents.map((event) => event.slug));
  for (const save of saves) {
    if (save.eventSlug && !known.has(save.eventSlug)) {
      let section = sections.find((s) => s.key === save.eventSlug);
      if (!section) {
        section = { key: save.eventSlug, title: { en: save.eventSlug }, data: [] };
        sections.push(section);
      }
      section.data.push(save);
    }
  }
  const notSure = saves.filter((save) => save.eventSlug === null);
  if (notSure.length > 0) {
    sections.push({ key: 'not-sure', title: { en: notSureLabel }, data: notSure });
  }
  return sections;
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  list: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  sectionHeader: {
    marginTop: Spacing.lg,
  },
  item: {
    gap: Spacing.xs,
  },
});
