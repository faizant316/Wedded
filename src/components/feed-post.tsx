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

import { AppText } from '@/components/app-text';
import { Glass } from '@/components/glass';
import { Icon } from '@/components/icon';
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
 * One vendor in the Discover feed, laid out like an Instagram business post:
 * who it is, their photos to swipe through, "Ask about price & date" right
 * under them, then Save, Ask and Share, and a caption. Double-tap a photo to
 * save it, with the heart bursting over it. No likes, followers or comments
 * (vision §4): the heart is Save.
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

  const name = localized(post.name, locale);
  const category = post.category ? localized(post.category.name, locale) : null;
  const caption = vendorText(post.caption.en ?? undefined, post.caption.pa ?? undefined, locale);
  const cover = post.photos[0];

  const openProfile = () => router.push({ pathname: '/v/[slug]', params: { slug: post.slug } });
  const ask = () => router.push({ pathname: '/ask', params: { vendorId: post.vendorId } });

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
                  style={{ width, height: width * 1.25 }}
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

      <Pressable
        accessibilityRole="button"
        onPress={ask}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <AppText weight={600} color="primary" style={styles.shrink}>
          {t('vendor.ask')}
        </AppText>
        <Icon name="chevron-forward" size={16} color={Colors.primary} weight="semibold" />
      </Pressable>

      <View style={styles.actions}>
        <ActionIcon
          icon={saved ? 'heart' : 'heart-outline'}
          color={saved ? Colors.primary : Colors.text}
          label={saved ? t('vendorCard.unsave', { name }) : t('vendorCard.save', { name })}
          onPress={save}
        />
        <ActionIcon
          icon="chatbubble-outline"
          color={Colors.text}
          label={t('discover.askLabel', { name })}
          onPress={ask}
        />
        <ActionIcon
          icon="paper-plane-outline"
          color={Colors.text}
          label={t('discover.shareLabel', { name })}
          onPress={() => void shareVendor({ name, category, city: post.city, slug: post.slug }, t)}
        />
        <View style={styles.spacer} />
        {post.photos.length > 1 && (
          <View style={styles.dots} accessible={false}>
            {post.photos.map((photo, i) => (
              <View key={photo.id} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
        )}
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

function ActionIcon({
  icon,
  color,
  label,
  onPress,
}: {
  icon: 'heart' | 'heart-outline' | 'chatbubble-outline' | 'paper-plane-outline';
  color: string;
  label: string;
  onPress: () => void;
}) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(1);
  const wasFilled = useRef(icon === 'heart');

  // The heart pops once when it fills (vision §4).
  useEffect(() => {
    const filled = icon === 'heart';
    if (filled && !wasFilled.current && !reduceMotion) {
      pop.value = withSequence(withTiming(1.3, { duration: 110 }), withSpring(1, Springs.pop));
    }
    wasFilled.current = filled;
  }, [icon, reduceMotion, pop]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.action, pressed && styles.dim]}
    >
      <Animated.View style={popStyle}>
        <Icon name={icon} size={27} color={color} />
      </Animated.View>
    </Pressable>
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
  cta: {
    minHeight: Sizes.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryTint,
  },
  ctaPressed: {
    backgroundColor: Colors.fillPressed,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  action: {
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    paddingRight: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.separator,
  },
  dotOn: {
    backgroundColor: Colors.primary,
  },
  body: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
}));
