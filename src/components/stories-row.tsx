import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { StoryRing } from '@/components/story-ring';
import { makeStyles, Sizes, Spacing } from '@/constants/theme';
import type { FeedPost } from '@/data/feed';
import { useStorySeen } from '@/features/discover/seen-stories';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * A row of story circles, one per vendor, running edge to edge past the page
 * gutter the way Instagram's does. Each opens the full-screen viewer at that
 * vendor. It scrolls sideways; it's content to browse, not a set of choices
 * someone could miss.
 */
export function StoriesRow({ posts }: { posts: FeedPost[] }) {
  const styles = useStyles();
  const router = useRouter();
  const { locale, t } = useLocale();
  const isSeen = useStorySeen();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.strip}
      accessibilityLabel={t('discover.stories')}
    >
      {posts.map((post) => {
        const name = localized(post.name, locale);
        return (
          <StoryRing
            key={post.vendorId}
            photoUrl={post.photos[0]?.url.small}
            label={name}
            seen={isSeen(post.vendorId)}
            accessibilityLabel={t('discover.openStory', { name })}
            onPress={() => router.push({ pathname: '/story', params: { vendor: post.slug } })}
          />
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  strip: {
    marginHorizontal: -Sizes.pageGutter,
  },
  row: {
    gap: Spacing.xs,
    paddingHorizontal: Sizes.pageGutter - 6,
  },
}));
