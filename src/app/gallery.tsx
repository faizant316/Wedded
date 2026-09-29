import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, useFontScale } from '@/components/app-text';
import { StateView } from '@/components/state-view';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useVendorPhotos } from '@/data/vendor-media';
import { useLocale } from '@/i18n/locale-context';

/**
 * S10 photo viewer: a vendor's photos full screen on black, swipe sideways,
 * "3 / 12" and the credit. The Close button is always visible, so nobody
 * needs to know a gesture to get out. /gallery?vendorId=…&index=…
 */
export default function GalleryScreen() {
  const { vendorId = '', index = '0' } = useLocalSearchParams<{
    vendorId: string;
    index?: string;
  }>();
  const router = useRouter();
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const scale = useFontScale('body');
  const photos = useVendorPhotos(vendorId);
  const start = Math.max(0, Number(index) || 0);
  const [current, setCurrent] = useState(start);

  const close = () => (router.canGoBack() ? router.back() : router.navigate('/'));
  const list = photos.data ?? [];
  const photo = list[current];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('gallery.close')}
          onPress={close}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        >
          <Ionicons name="close" size={Sizes.icon * scale} color={Colors.onPrimary} />
          <AppText variant="button" color="onPrimary">
            {t('gallery.close')}
          </AppText>
        </Pressable>
        {list.length > 0 && (
          <AppText color="onPrimary" weight={700} style={styles.counter}>
            {`${current + 1} / ${list.length}`}
          </AppText>
        )}
      </View>

      {photos.isPending ? (
        <StateView state="loading" />
      ) : list.length === 0 ? (
        <StateView state="error" onRetry={() => void photos.refetch()} />
      ) : (
        <FlatList
          data={list}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={Math.min(start, list.length - 1)}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(event) =>
            setCurrent(Math.round(event.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index: i }) => (
            <View style={{ width }}>
              <Image
                source={{ uri: item.url.large }}
                placeholder={item.blurhash ? { blurhash: item.blurhash } : undefined}
                contentFit="contain"
                accessible
                accessibilityLabel={
                  item.credit ?? t('gallery.photoOf', { number: i + 1, total: list.length })
                }
                style={styles.photo}
              />
            </View>
          )}
          style={styles.list}
        />
      )}

      {photo?.credit && (
        <View style={styles.caption}>
          <AppText color="onPrimary">{photo.credit}</AppText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.viewer,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Sizes.pageGutter,
    paddingVertical: Spacing.sm,
  },
  close: {
    minHeight: Sizes.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    backgroundColor: Colors.scrim,
  },
  closePressed: {
    backgroundColor: Colors.primary,
  },
  counter: {
    fontVariant: ['tabular-nums'],
  },
  list: {
    flex: 1,
  },
  photo: {
    flex: 1,
  },
  caption: {
    paddingHorizontal: Sizes.pageGutter,
    paddingVertical: Spacing.md,
  },
});
