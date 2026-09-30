import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import type { FeedPost } from '@/data/feed';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * A sideways shelf of vendor cards, as on the App Store's front page: a
 * photo, the name and "Type · City". Each opens the vendor's profile.
 */
export function VendorShelf({ posts }: { posts: FeedPost[] }) {
  const Colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const { locale } = useLocale();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.strip}
    >
      {posts.map((post) => {
        const name = localized(post.name, locale);
        const category = post.category ? localized(post.category.name, locale) : null;
        const photo = post.photos[0];
        return (
          <PressableScale
            key={post.vendorId}
            accessibilityRole="button"
            accessibilityLabel={[name, category, post.city].filter(Boolean).join(', ')}
            onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: post.slug } })}
            style={styles.card}
          >
            <View>
              {photo ? (
                <Image
                  source={{ uri: photo.url.small }}
                  placeholder={photo.blurhash ? { blurhash: photo.blurhash } : undefined}
                  contentFit="cover"
                  transition={150}
                  accessible={false}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photo} />
              )}
              {post.foundingNumber != null && (
                <Glass style={styles.badge}>
                  <Icon name="ribbon-outline" size={14} color={Colors.kesari} weight="semibold" />
                  <AppText variant="caption" weight={700} color="kesari">
                    {`#${post.foundingNumber}`}
                  </AppText>
                </Glass>
              )}
            </View>
            <View style={styles.text}>
              <AppText weight={600} numberOfLines={1}>
                {name}
              </AppText>
              <AppText variant="label" weight={400} color="text2" numberOfLines={1}>
                {[category, post.city].filter(Boolean).join(' · ')}
              </AppText>
            </View>
          </PressableScale>
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
    width: 232,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: Colors.skeleton,
  },
  badge: {
    position: 'absolute',
    left: Spacing.sm,
    top: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.chip,
  },
  text: {
    gap: 2,
    padding: Spacing.md,
  },
}));
