import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { type VideoPlayer, useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Radius, Spacing, Springs } from '@/constants/theme';
import { compactCount, type Reel } from '@/data/reels';
import { initials } from '@/features/planner/plan-together';
import { useLocale } from '@/i18n/locale-context';
import { saveHaptic } from '@/lib/haptics';

// Reels play over video in both light and dark mode, so the text and icons on
// them are always white with a soft shadow, like TikTok's and Instagram's.
export const REEL_INK = '#FFFFFF';
export const REEL_DIM = 'rgba(255,255,255,0.78)';
const SHADE = 'rgba(0,0,0,0.38)';
const PILL = 'rgba(255,255,255,0.18)';
const LIKED = '#FF3B5C';

const DOUBLE_TAP_MS = 280;

// The player is an object the hook owns; these change it from effects.
function setSound(player: VideoPlayer, muted: boolean) {
  player.muted = muted;
}
function playOrPause(player: VideoPlayer, play: boolean, rewind: boolean) {
  if (play) {
    player.play();
    return;
  }
  player.pause();
  if (rewind) player.currentTime = 0;
}

export type ReelActions = {
  onLike: (reel: Reel, like: boolean) => void;
  onFollow: (reel: Reel) => void;
  onComments: (reel: Reel) => void;
  onShare: (reel: Reel) => void;
  onMore: (reel: Reel) => void;
};

/**
 * One reel, filling the screen: the clip (looping, playing only while it's
 * the one on screen), a tap to pause, a double tap to like with a heart
 * burst, the action rail on the right (poster with follow, like, comment,
 * share, more) and, at the bottom, who posted it, the caption, the event and
 * the vendors tagged in it, each opening that vendor's page.
 */
export function ReelItem({
  reel,
  height,
  active,
  muted,
  eventName,
  bottomSpace,
  onToggleMute,
  ...actions
}: ReelActions & {
  reel: Reel;
  height: number;
  /** On screen now: plays; otherwise paused at the start. */
  active: boolean;
  muted: boolean;
  /** The event's name in the family's language, when it's tagged. */
  eventName: string | null;
  /** Room for the floating tab bar under the caption. */
  bottomSpace: number;
  onToggleMute: () => void;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);
  const singleTap = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burst = useSharedValue(0);

  const player = useVideoPlayer(reel.videoUrl, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'readyToPlay') setReady(true);
  });

  // Scrolled away: start fresh, unpaused, next time it's on screen
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setPaused(false);
  }

  useEffect(() => setSound(player, muted), [player, muted]);
  useEffect(() => playOrPause(player, active && !paused, !active), [active, paused, player]);

  useEffect(
    () => () => {
      if (singleTap.current) clearTimeout(singleTap.current);
    },
    [],
  );

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.4 + burst.value * 0.8 }],
  }));

  // One tap pauses; two quick taps like (never unlike), with a heart burst
  const onVideoPress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (singleTap.current) clearTimeout(singleTap.current);
      if (!reduceMotion) {
        burst.set(
          withSequence(
            withSpring(1, Springs.pop),
            withDelay(350, withTiming(0, { duration: 220 })),
          ),
        );
      }
      if (!reel.liked) {
        saveHaptic();
        actions.onLike(reel, true);
      }
      return;
    }
    lastTap.current = now;
    singleTap.current = setTimeout(() => setPaused((p) => !p), DOUBLE_TAP_MS);
  };

  const poster = reel.vendor?.name ?? reel.authorName ?? t('reels.someone');
  const openPoster = () =>
    reel.vendor
      ? router.push({ pathname: '/v/[slug]', params: { slug: reel.vendor.slug } })
      : router.push({ pathname: '/u/[id]', params: { id: reel.authorId } });

  return (
    <View style={[styles.page, { height }]}>
      <Pressable
        onPress={onVideoPress}
        accessibilityRole="button"
        accessibilityLabel={paused ? t('reels.play') : t('reels.pause')}
        style={StyleSheet.absoluteFill}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
          surfaceType="textureView"
        />
        {/* The thumbnail until the first frame is ready */}
        {!ready && reel.thumbUrl && (
          <Image
            source={{ uri: reel.thumbUrl }}
            contentFit="cover"
            style={StyleSheet.absoluteFill}
          />
        )}
        {paused && (
          <View style={styles.center} pointerEvents="none">
            <Icon name="play" size={64} color={REEL_DIM} />
          </View>
        )}
        <Animated.View style={[styles.center, burstStyle]} pointerEvents="none">
          <Icon name="heart" size={110} color={LIKED} />
        </Animated.View>
      </Pressable>

      {/* Shade under the words so they read over any video */}
      <View pointerEvents="none" style={[styles.shade, { height: 260 + bottomSpace }]} />

      <View style={[styles.rail, { bottom: bottomSpace + Spacing.lg }]}>
        <View style={styles.posterButton}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={poster}
            onPress={openPoster}
            style={styles.avatar}
          >
            {reel.vendor ? (
              <Icon name="storefront-outline" size={24} color={REEL_INK} />
            ) : (
              <AppText weight={700} style={styles.ink}>
                {initials(reel.authorName)}
              </AppText>
            )}
          </Pressable>
          {!reel.isMine && !reel.following && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('reels.follow', { name: poster })}
              onPress={() => actions.onFollow(reel)}
              hitSlop={8}
              style={styles.followDot}
            >
              <Icon name="add" size={16} color={REEL_INK} weight="bold" />
            </Pressable>
          )}
        </View>
        <RailButton
          icon={reel.liked ? 'heart' : 'heart-outline'}
          color={reel.liked ? LIKED : REEL_INK}
          label={compactCount(reel.likeCount)}
          spoken={reel.liked ? t('reels.unlike') : t('reels.like')}
          onPress={() => {
            if (!reel.liked) saveHaptic();
            actions.onLike(reel, !reel.liked);
          }}
        />
        <RailButton
          icon="chatbubble-outline"
          label={compactCount(reel.commentCount)}
          spoken={t('reels.comments', { count: reel.commentCount })}
          onPress={() => actions.onComments(reel)}
        />
        <RailButton
          icon="paper-plane-outline"
          label={t('reels.share')}
          spoken={t('reels.share')}
          onPress={() => actions.onShare(reel)}
        />
        <RailButton
          icon={muted ? 'volume-mute' : 'volume-high'}
          label={muted ? t('reels.soundOff') : t('reels.soundOn')}
          spoken={muted ? t('reels.turnSoundOn') : t('reels.turnSoundOff')}
          onPress={onToggleMute}
        />
        <RailButton
          icon="ellipsis-horizontal"
          label=""
          spoken={t('reels.more')}
          onPress={() => actions.onMore(reel)}
        />
      </View>

      <View style={[styles.info, { bottom: bottomSpace + Spacing.md }]}>
        <Pressable accessibilityRole="link" onPress={openPoster} style={styles.posterRow}>
          <AppText variant="bodyLg" weight={700} numberOfLines={1} style={styles.ink}>
            {poster}
          </AppText>
          {reel.vendor && (
            <View style={styles.vendorBadge}>
              <AppText variant="caption" weight={700} style={styles.ink}>
                {t('reels.vendor')}
              </AppText>
            </View>
          )}
        </Pressable>
        {reel.caption && (
          <Pressable onPress={() => setExpanded((e) => !e)} accessibilityRole="button">
            <AppText numberOfLines={expanded ? 8 : 2} style={styles.ink}>
              {reel.caption}
            </AppText>
          </Pressable>
        )}
        {eventName && (
          <View style={styles.eventPill}>
            <Icon name="sparkles" size={14} color={REEL_INK} />
            <AppText variant="label" weight={600} style={styles.ink}>
              {eventName}
            </AppText>
          </View>
        )}
        {reel.tags.length > 0 && (
          <View style={styles.tags}>
            {reel.tags.map((tag) => (
              <Pressable
                key={tag.vendorId}
                accessibilityRole="link"
                accessibilityLabel={t('reels.taggedVendor', { name: tag.name })}
                onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: tag.slug } })}
                style={({ pressed }) => [styles.tag, pressed && styles.pressed]}
              >
                <Icon name="storefront-outline" size={14} color={REEL_INK} />
                <AppText variant="label" weight={600} numberOfLines={1} style={styles.ink}>
                  {tag.name}
                </AppText>
                <Icon name="chevron-forward" size={12} color={REEL_DIM} />
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function RailButton({
  icon,
  label,
  spoken,
  color = REEL_INK,
  onPress,
}: {
  icon: Parameters<typeof Icon>[0]['name'];
  label: string;
  spoken: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={spoken}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.railButton, pressed && styles.pressed]}
    >
      <Icon name={icon} size={32} color={color} />
      {label.length > 0 && (
        <AppText variant="caption" weight={700} style={styles.ink}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  center: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SHADE,
    opacity: 0.55,
  },
  ink: {
    color: REEL_INK,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rail: {
    position: 'absolute',
    right: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  posterButton: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: REEL_INK,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(138,28,51,0.9)',
  },
  followDot: {
    position: 'absolute',
    bottom: -10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIKED,
  },
  railButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  info: {
    position: 'absolute',
    left: Spacing.lg,
    right: 84,
    gap: Spacing.sm,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 32,
  },
  vendorBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.chip,
    backgroundColor: PILL,
  },
  eventPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 30,
    borderRadius: Radius.chip,
    backgroundColor: PILL,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    backgroundColor: PILL,
  },
});
