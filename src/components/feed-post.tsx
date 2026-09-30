import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText, useFontScale } from '@/components/app-text';
import { Glass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { makeStyles, Radius, Sizes, Spacing, Springs, useColors } from '@/constants/theme';
import type { FeedPost as Post } from '@/data/feed';
import { priceLine } from '@/features/vendors/profile-format';
import { shareVendor } from '@/features/vendors/share';
import { localized, vendorText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { saveHaptic } from '@/lib/haptics';

const DOUBLE_TAP_MS = 280;

export type FeedPostProps = {
  post: Post;
  saved: boolean;
  /** Saves or removes (useSaveVendor().toggleSave). */
  onToggleSave: () => void;
};

/**
 * One vendor in the Discover feed: who it is, their photos to swipe through
 * (4:3, like the profile cover), then three labelled buttons, Save, Ask and
 * Share, and a caption. Words rather than Instagram's bare icons, so nobody has
 * to guess what a speech bubble or paper plane does (DECISIONS 2026-09-30).
 * Double-tap a photo to save it, with the heart bursting over it. No likes,
 * followers or comments (vision §4).
 */
export function FeedPost({ post, saved, onToggleSave }: FeedPostProps) {
  const Colors = useColors();
  const styles = useStyles();
  const router = useRouter();
  const { locale, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const lastTap = useRef(0);
  const burst = useSharedValue(0);
  // Three buttons side by side stop fitting once the text is very large.
  const stackActions = useFontScale('button') >= 1.5;

  const name = localized(post.name, locale);
  const category = post.category ? localized(post.category.name, locale) : null;
  const caption = vendorText(post.caption.en ?? undefined, post.caption.pa ?? undefined, locale);
  const cover = post.photos[0];

  const openProfile = () => router.push({ pathname: '/v/[slug]', params: { slug: post.slug } });
  const ask = () => router.push({ pathname: '/ask', params: { vendorId: post.vendorId } });
  const share = () => void shareVendor({ name, category, city: post.city, slug: post.slug }, t);

  const save = () => {
    if (!saved) saveHaptic();
    onToggleSave();
  };

  // Instagram's double-tap: it only ever saves, never removes.
  const onPhotoPress = () => {
    const now = Date.now();
    if (now - lastTap.current < DOUBLE_TAP_MS) {
      lastTap.current = 0;
      if (!reduceMotion) {
        burst.value = withSequence(
          withSpring(1, Springs.pop),
          withDelay(350, withTiming(0, { duration: 200 })),
        );
      }
      if (!saved) save();
    } else {
      lastTap.current = now;
    }
  };

  const burstStyle = useAnimatedStyle(() => ({
    opacity: burst.value,
    transform: [{ scale: 0.4 + burst.value * 0.6 }],
  }));

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[name, category, post.city].filter(Boolean).join(', ')}
        onPress={openProfile}
        style={({ pressed }) => [styles.header, pressed && styles.dim]}
      >
        {cover ? (
          <Image
            source={{ uri: cover.url.small }}
            contentFit="cover"
            accessible={false}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatar} />
        )}
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <AppText weight={600} numberOfLines={1} style={styles.shrink}>
              {name}
            </AppText>
            {post.foundingNumber != null && (
              <Icon name="ribbon-outline" size={16} color={Colors.kesari} weight="semibold" />
            )}
          </View>
          <AppText variant="caption" color="text2" numberOfLines={1}>
            {[category, post.city].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <Icon name="chevron-forward" size={16} color={Colors.chevron} weight="semibold" />
      </Pressable>

      <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 && (
          <FlatList
            data={post.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(photo) => photo.id}
            onScroll={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={32}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item, index: i }) => (
              <Pressable
                onPress={onPhotoPress}
                accessibilityRole="image"
                accessibilityLabel={t('discover.photoOf', {
                  number: i + 1,
                  total: post.photos.length,
                  name,
                })}
                accessibilityHint={t('discover.doubleTapHint')}
              >
                <Image
                  source={{ uri: item.url.medium }}
                  placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
                  contentFit="cover"
                  transition={200}
                  accessible={false}
                  style={{ width, height: width * 0.75 }}
                />
              </Pressable>
            )}
          />
        )}
        {post.photos.length > 1 && (
          <Glass style={styles.counter}>
            <AppText variant="caption" weight={600} style={styles.tabular}>
              {`${index + 1}/${post.photos.length}`}
            </AppText>
          </Glass>
        )}
        <Animated.View style={[styles.burst, burstStyle]} pointerEvents="none">
          <Icon name="heart" size={96} color={Colors.onPhoto} />
        </Animated.View>
      </View>

      <View style={[styles.actions, stackActions && styles.actionsStacked]}>
        <PostAction
          icon={saved ? 'heart' : 'heart-outline'}
          label={saved ? t('vendor.saved') : t('vendor.save')}
          accessibilityLabel={
            saved ? t('vendorCard.unsave', { name }) : t('vendorCard.save', { name })
          }
          selected={saved}
          onPress={save}
        />
        <PostAction
          icon="chatbubble-outline"
          label={t('discover.ask')}
          accessibilityLabel={t('discover.askLabel', { name })}
          filled
          onPress={ask}
        />
        <PostAction
          icon="share-outline"
          label={t('discover.share')}
          accessibilityLabel={t('discover.shareLabel', { name })}
          onPress={share}
        />
      </View>

      <View style={styles.body}>
        {caption && (
          <Pressable onPress={() => setExpanded((open) => !open)} accessibilityRole="text">
            <AppText numberOfLines={expanded ? undefined : 2}>
              <AppText weight={600}>{`${name}  `}</AppText>
              {caption}
            </AppText>
          </Pressable>
        )}
        {post.price && (
          <AppText weight={600} style={styles.tabular}>
            {priceLine(post.price, t)}
          </AppText>
        )}
      </View>
    </View>
  );
}

/**
 * One of the post's three buttons: an icon and a word in a capsule. `filled` is
 * the main action (Ask); `selected` fills the heart and pops it once (vision §4).
 */
function PostAction({
  icon,
  label,
  accessibilityLabel,
  filled = false,
  selected = false,
  onPress,
}: {
  icon: IconName;
  label: string;
  accessibilityLabel: string;
  filled?: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  const Colors = useColors();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(1);
  const wasSelected = useRef(selected);

  useEffect(() => {
    if (selected && !wasSelected.current && !reduceMotion) {
      pop.value = withSequence(withTiming(1.3, { duration: 110 }), withSpring(1, Springs.pop));
    }
    wasSelected.current = selected;
  }, [selected, reduceMotion, pop]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const tint = filled ? Colors.onPrimary : Colors.primary;
  // The icon grows with the label so it doesn't look lost next to large text.
  const iconScale = Math.min(useFontScale('button'), 1.6);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected ? { selected: true } : undefined}
      onPress={onPress}
      pressedScale={0.94}
      style={[styles.action, filled ? styles.actionFilled : styles.actionTinted]}
    >
      <Animated.View style={popStyle}>
        <Icon name={icon} size={Sizes.iconSmall * iconScale} color={tint} weight="semibold" />
      </Animated.View>
      <AppText
        variant="button"
        color={filled ? 'onPrimary' : 'primary'}
        numberOfLines={2}
        style={styles.actionLabel}
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

const useStyles = makeStyles((Colors) => ({
  card: {
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.md,
    minHeight: Sizes.tapTarget + 8,
  },
  dim: {
    opacity: 0.6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.skeleton,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  shrink: {
    flexShrink: 1,
  },
  counter: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    borderRadius: Radius.chip,
  },
  burst: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  action: {
    flex: 1,
    minHeight: Sizes.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.button,
    borderCurve: 'continuous',
  },
  actionTinted: {
    backgroundColor: Colors.primaryTint,
  },
  actionFilled: {
    backgroundColor: Colors.primaryFill,
  },
  actionLabel: {
    flexShrink: 1,
    textAlign: 'center',
  },
  body: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
}));
