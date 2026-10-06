import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Radius, Spacing, useScheme } from '@/constants/theme';
import type { FeedMode } from '@/data/reels';
import { useSession } from '@/features/auth/session';
import { REEL_DIM, REEL_INK } from '@/features/reels/reel-item';
import { ReelsPager } from '@/features/reels/reels-pager';
import { useLocale } from '@/i18n/locale-context';
import { selectionHaptic } from '@/lib/haptics';

/**
 * Reels (the Discover tab; DECISIONS.md 2026-10-05): wedding clips from
 * families and vendors, one per screen, swipe up for the next. Following
 * shows the people and vendors you follow; For you shows everything. The
 * vendors tagged in each clip are one tap away.
 */
export default function ReelsScreen() {
  const { t } = useLocale();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { status, requireSignIn } = useSession();
  const [mode, setMode] = useState<FeedMode>('for_you');
  const scheme = useScheme();

  // White clock and battery over the videos; back to the app's on the way out
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle(scheme === 'dark' ? 'light' : 'dark');
    }, [scheme]),
  );

  const choose = (next: FeedMode) => {
    if (next === mode) return;
    selectionHaptic();
    setMode(next);
  };

  const emptyFollowing =
    status === 'signedIn' ? (
      <Empty
        icon="people-outline"
        title={t('reels.followingEmptyTitle')}
        body={t('reels.followingEmptyBody')}
        action={t('reels.goForYou')}
        onAction={() => setMode('for_you')}
      />
    ) : (
      <Empty
        icon="people-outline"
        title={t('reels.followingSignInTitle')}
        body={t('reels.followingSignInBody')}
        action={t('reels.signIn')}
        onAction={() => requireSignIn()}
      />
    );
  const emptyForYou = (
    <Empty
      icon="film-outline"
      title={t('reels.emptyTitle')}
      body={t('reels.emptyBody')}
      action={t('reels.browseVendors')}
      onAction={() => router.push('/search')}
    />
  );

  return (
    <View style={styles.screen}>
      <ReelsPager
        key={mode}
        feed={{ mode }}
        height={height}
        swipeHint
        empty={mode === 'following' ? emptyFollowing : emptyForYou}
      />

      <View style={[styles.top, { paddingTop: insets.top + Spacing.xs }]} pointerEvents="box-none">
        {/* Post a reel: top right, where Instagram's Reels camera sits */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reels.create')}
          onPress={() => requireSignIn(() => router.push('/post-reel'))}
          hitSlop={8}
          style={({ pressed }) => [
            styles.create,
            { top: insets.top + Spacing.xs },
            pressed && styles.pressed,
          ]}
        >
          <Icon name="camera-outline" size={28} color={REEL_INK} style={styles.iconShadow} />
        </Pressable>
        <View style={styles.tabs} accessibilityRole="tablist">
          {(['following', 'for_you'] as const).map((m) => (
            <Pressable
              key={m}
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === m }}
              onPress={() => choose(m)}
              hitSlop={8}
              style={styles.tab}
            >
              <AppText
                variant="bodyLg"
                weight={mode === m ? 700 : 600}
                style={[styles.tabText, mode !== m && styles.tabDim]}
              >
                {m === 'following' ? t('reels.following') : t('reels.forYou')}
              </AppText>
              <View style={[styles.underline, mode !== m && styles.hidden]} />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

function Empty({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  title: string;
  body: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <View style={styles.empty}>
      <Icon name={icon} size={48} color={REEL_INK} />
      <AppText variant="heading" weight={700} style={[styles.tabText, styles.centerText]}>
        {title}
      </AppText>
      <AppText style={[styles.dimText, styles.centerText]}>{body}</AppText>
      <Pressable
        accessibilityRole="button"
        onPress={onAction}
        style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
      >
        <AppText weight={700} style={styles.emptyButtonText}>
          {action}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  create: {
    position: 'absolute',
    right: Spacing.md,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tab: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    color: REEL_INK,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabDim: {
    color: REEL_DIM,
  },
  underline: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: REEL_INK,
  },
  hidden: {
    opacity: 0,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  centerText: {
    textAlign: 'center',
  },
  dimText: {
    color: REEL_DIM,
  },
  emptyButton: {
    minHeight: 48,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    borderRadius: Radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REEL_INK,
  },
  emptyButtonText: {
    color: '#000000',
  },
  pressed: {
    opacity: 0.6,
  },
});
