import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/button';
import { GlassButton } from '@/components/glass-button';
import { Icon } from '@/components/icon';
import { StateView } from '@/components/state-view';
import { Radius, Spacing, useColors } from '@/constants/theme';
import {
  compactCount,
  useReelPerson,
  useReelsFeed,
  useToggleBlock,
  useToggleFollow,
} from '@/data/reels';
import { useSession } from '@/features/auth/session';
import { initials } from '@/features/planner/plan-together';
import { useLocale } from '@/i18n/locale-context';

/**
 * A person's page in Reels: "Asha K.", how many reels, followers and
 * following, Follow, Report or Block, and their reels as a grid that opens
 * the full-screen viewer. People who blocked you see "not available".
 */
export default function PersonScreen() {
  const Colors = useColors();
  const router = useRouter();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { session, requireSignIn } = useSession();
  const person = useReelPerson(id);
  const reels = useReelsFeed({ mode: 'person', userId: id });
  const follow = useToggleFollow();
  const block = useToggleBlock();
  const isMe = session?.user.id === id;
  const list = reels.data?.pages.flat() ?? [];
  const tile = Math.floor((width - 2 * Spacing.lg - 2 * 2) / 3);

  const more = () => {
    if (!person.data) return;
    const name = person.data.name ?? t('reels.someone');
    const choices = [
      {
        text: t('reels.reportPerson'),
        onPress: () =>
          requireSignIn(() => router.push({ pathname: '/reel-report', params: { user: id } })),
      },
      {
        text: person.data.blocked ? t('reels.unblock', { name }) : t('reels.block', { name }),
        style: 'destructive' as const,
        onPress: () =>
          requireSignIn(() => block.mutate({ userId: id, block: !person.data?.blocked })),
      },
    ];
    if (Platform.OS === 'web') {
      if (globalThis.confirm(choices[0].text)) choices[0].onPress();
      return;
    }
    Alert.alert(name, undefined, [...choices, { text: t('reels.cancel'), style: 'cancel' }]);
  };

  let body;
  if (person.isPending) body = <StateView state="loading" />;
  else if (person.isError) body = <StateView state="error" onRetry={() => void person.refetch()} />;
  else if (!person.data)
    body = <StateView state="empty" icon="person-outline" message={t('reels.personGone')} />;
  else {
    const p = person.data;
    body = (
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: Colors.primaryFill }]}>
            <AppText variant="title" weight={700} color="onPrimary">
              {initials(p.name)}
            </AppText>
          </View>
          <AppText variant="title" weight={700} accessibilityRole="header">
            {p.name ?? t('reels.someone')}
          </AppText>
          <View style={styles.counts}>
            {[
              { n: p.reelCount, label: t('reels.reelsCount') },
              { n: p.followerCount, label: t('reels.followers') },
              { n: p.followingCount, label: t('reels.followingCount') },
            ].map((c) => (
              <View key={c.label} style={styles.count}>
                <AppText variant="heading" weight={700}>
                  {compactCount(c.n)}
                </AppText>
                <AppText variant="label" weight={400} color="text2">
                  {c.label}
                </AppText>
              </View>
            ))}
          </View>
          {!isMe && !p.blocked && (
            <Button
              variant={p.following ? 'secondary' : 'primary'}
              label={p.following ? t('reels.followingButton') : t('reels.followButton')}
              onPress={() =>
                requireSignIn(() => follow.mutate({ target: { userId: id }, follow: !p.following }))
              }
              style={styles.follow}
            />
          )}
          {p.blocked && <AppText color="text2">{t('reels.youBlocked')}</AppText>}
        </View>

        {list.length === 0 ? (
          <AppText color="text2" style={styles.center}>
            {t('reels.noReelsYet')}
          </AppText>
        ) : (
          <View style={styles.grid}>
            {list.map((reel, index) => (
              <Pressable
                key={reel.id}
                accessibilityRole="button"
                accessibilityLabel={reel.caption ?? t('reels.reel')}
                onPress={() =>
                  router.push({
                    pathname: '/reels-viewer',
                    params: { user: id, index: String(index) },
                  })
                }
                style={[styles.tile, { width: tile, height: Math.round((tile * 16) / 9) }]}
              >
                {reel.thumbUrl ? (
                  <Image
                    source={{ uri: reel.thumbUrl }}
                    contentFit="cover"
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.fill }]} />
                )}
                <View style={styles.tileLikes}>
                  <Icon name="heart" size={12} color="#FFFFFF" />
                  <AppText variant="caption" weight={700} style={styles.white}>
                    {compactCount(reel.likeCount)}
                  </AppText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: Colors.bg, paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <BackButton />
        {!isMe && person.data && (
          <GlassButton
            icon="ellipsis-horizontal"
            accessibilityLabel={t('reels.more')}
            onPress={more}
          />
        )}
      </View>
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    minHeight: 52,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counts: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  count: {
    alignItems: 'center',
  },
  follow: {
    alignSelf: 'stretch',
  },
  center: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  tile: {
    borderRadius: Radius.photo / 3,
    overflow: 'hidden',
  },
  tileLikes: {
    position: 'absolute',
    left: Spacing.xs,
    bottom: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  white: {
    color: '#FFFFFF',
  },
});
