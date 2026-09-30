import { useState } from 'react';
import { RefreshControl, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { FeedPost } from '@/components/feed-post';
import { LargeTitle, NavBar, useNavScroll, useNavTop } from '@/components/nav';
import { StateView } from '@/components/state-view';
import { RealWeddingCards } from '@/components/real-wedding-cards';
import { useBottomSpace } from '@/components/tab-bar';
import { makeStyles, Sizes, Spacing, useColors } from '@/constants/theme';
import { useFeed } from '@/data/feed';
import { useSavedVendors, useSaveVendor } from '@/data/saved';
import { useLocale } from '@/i18n/locale-context';

/**
 * Discover: the vendors' photos as a feed, with big "Real weddings" cards
 * along the top, one per event. Tap a card for the full-screen viewer; swipe a post's photos; double-tap to save; Ask straight from the
 * post. Every post opens the vendor's profile.
 */
export default function DiscoverScreen() {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const scroll = useNavScroll();
  const top = useNavTop();
  const bottom = useBottomSpace();
  const feed = useFeed();
  const saves = useSavedVendors();
  const { toggleSave } = useSaveVendor();
  const [refreshing, setRefreshing] = useState(false);

  const savedIds = new Set((saves.data ?? []).map((save) => save.vendorId));
  const posts = feed.data ?? [];

  async function onRefresh() {
    setRefreshing(true);
    await feed.refetch();
    setRefreshing(false);
  }

  const header = (
    <View style={styles.header}>
      <LargeTitle scroll={scroll} title={t('discover.title')} eyebrow={t('discover.eyebrow')} />
      {posts.length > 0 && <RealWeddingCards posts={posts} />}
    </View>
  );

  let empty = null;
  if (feed.isPending) empty = <StateView state="loading" />;
  else if (feed.isError) empty = <StateView state="error" onRetry={() => void feed.refetch()} />;
  else empty = <StateView state="empty" icon="images-outline" message={t('discover.empty')} />;

  return (
    <View style={styles.screen}>
      <Animated.FlatList
        data={posts}
        keyExtractor={(post) => post.vendorId}
        onScroll={scroll.onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderItem={({ item }) => (
          <FeedPost
            post={item}
            saved={savedIds.has(item.vendorId)}
            onToggleSave={() => toggleSave(item.vendorId)}
          />
        )}
        initialNumToRender={3}
        windowSize={5}
        contentContainerStyle={[styles.content, { paddingTop: top, paddingBottom: bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.chevron}
            colors={[Colors.primary]}
          />
        }
      />
      <NavBar scroll={scroll} title={t('discover.title')} back={false} />
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    gap: Spacing.xl,
    paddingHorizontal: Sizes.pageGutter,
  },
  header: {
    gap: Spacing.lg,
  },
}));
