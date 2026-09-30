import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { PressableScale } from '@/components/pressable-scale';
import { gradient, makeStyles, Radius, Sizes, Spacing } from '@/constants/theme';
import type { FeedPost } from '@/data/feed';
import { useHomeEvents } from '@/data/reference';
import { groupRealWeddings } from '@/features/discover/real-weddings';
import { bilingual, localized, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

const MAX_NAMES = 2;

/**
 * "Real weddings": one big card per event (Jaago, Reception...) with a photo
 * from it and the vendors who worked it, swiped sideways and snapping card by
 * card. Tapping opens that photo in the full-screen viewer. Replaces the story
 * circles (DECISIONS 2026-09-30), so the app doesn't read as Instagram.
 */
export function RealWeddingCards({ posts }: { posts: FeedPost[] }) {
  const styles = useStyles();
  const router = useRouter();
  const { locale, t } = useLocale();
  const events = useHomeEvents();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.62, 260);

  const all = (events.data ?? []).flatMap((section) => section.events);
  const eventName = (slug: string): LocalizedText =>
    all.find((event) => event.slug === slug)?.name ?? { en: slug };
  const weddings = groupRealWeddings(
    posts,
    all.map((event) => event.slug),
  );
  if (weddings.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + Spacing.md}
      decelerationRate="fast"
      contentContainerStyle={styles.row}
      style={styles.strip}
    >
      {weddings.map((wedding, i) => {
        const { primary, secondary } = bilingual(eventName(wedding.eventSlug), locale);
        const names = wedding.vendors.map((vendor) => localized(vendor.name, locale));
        const shown = names.slice(0, MAX_NAMES).join(' · ');
        const more = names.length - MAX_NAMES;
        const byLine = more > 0 ? t('discover.andMore', { names: shown, count: more }) : shown;
        return (
          <Animated.View key={wedding.eventSlug} entering={FadeInRight.delay(i * 60).springify()}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={`${primary.text}, ${byLine}`}
              onPress={() =>
                router.push({
                  pathname: '/story',
                  params: { vendor: wedding.vendorSlug, photo: wedding.photo.id },
                })
              }
              style={[styles.card, { width: cardWidth }]}
            >
              <Image
                source={{ uri: wedding.photo.url.medium }}
                placeholder={
                  wedding.photo.blurhash ? { blurhash: wedding.photo.blurhash } : undefined
                }
                contentFit="cover"
                accessible={false}
                style={styles.photo}
              />
              <View style={styles.scrim} />
              <View style={styles.caption}>
                <AppText variant="heading" weight={700} color="onPhoto" lang={primary.lang}>
                  {primary.text}
                </AppText>
                {secondary && (
                  <AppText variant="label" color="onPhoto" lang={secondary.lang}>
                    {secondary.text}
                  </AppText>
                )}
                <AppText variant="caption" color="onPhoto" numberOfLines={2}>
                  {byLine}
                </AppText>
              </View>
            </PressableScale>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles((Colors) => ({
  strip: {
    marginHorizontal: -Sizes.pageGutter,
  },
  row: {
    gap: Spacing.md,
    paddingHorizontal: Sizes.pageGutter,
  },
  card: {
    aspectRatio: 4 / 5,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: Colors.skeleton,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Dark at the bottom so the white words stay readable on any photo.
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...gradient('linear-gradient(to bottom, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.72) 100%)'),
  },
  caption: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
    gap: 2,
  },
}));
