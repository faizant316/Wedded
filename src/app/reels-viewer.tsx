import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { GlassButton } from '@/components/glass-button';
import { Spacing } from '@/constants/theme';
import { REEL_DIM } from '@/features/reels/reel-item';
import { ReelsPager } from '@/features/reels/reels-pager';
import { useLocale } from '@/i18n/locale-context';

/**
 * One person's or vendor's reels full screen, starting at the one tapped in
 * their grid: `?user={id}` or `?vendor={id}`, and `&index=` to start from.
 */
export default function ReelsViewerScreen() {
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { user, vendor, index } = useLocalSearchParams<{
    user?: string;
    vendor?: string;
    index?: string;
  }>();
  const feed = vendor
    ? ({ mode: 'vendor', vendorId: vendor } as const)
    : ({ mode: 'person', userId: user ?? '' } as const);

  return (
    <View style={styles.screen}>
      <ReelsPager
        feed={feed}
        height={height}
        initialIndex={Number(index) || 0}
        empty={<AppText style={{ color: REEL_DIM }}>{t('reels.noReelsYet')}</AppText>}
      />
      <View style={[styles.close, { top: insets.top + Spacing.xs }]}>
        <GlassButton
          icon="chevron-back"
          accessibilityLabel={t('common.back')}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  close: {
    position: 'absolute',
    left: Spacing.lg,
  },
});
