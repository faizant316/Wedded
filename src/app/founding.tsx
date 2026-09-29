import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useFoundingVendors } from '@/data/vendors';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * The Founding Wall (vision doc §13): vendors with a founding number, in the
 * order they joined, each opening their profile. Deep link: /founding.
 */
export default function FoundingWallScreen() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const scale = useFontScale('body');
  const vendors = useFoundingVendors();

  const header = (
    <View style={styles.header}>
      <Head>
        <title>{t('founding.title')}</title>
        <meta name="description" content={t('founding.intro')} />
      </Head>
      <BackButton />
      <AppText variant="title" accessibilityRole="header">
        {t('founding.title')}
      </AppText>
      <AppText variant="bodyLg" color="text2">
        {t('founding.intro')}
      </AppText>
    </View>
  );

  let empty;
  if (vendors.isPending) empty = <StateView state="loading" />;
  else if (vendors.isError) {
    empty = <StateView state="error" onRetry={() => void vendors.refetch()} />;
  } else empty = <StateView state="empty" icon="ribbon-outline" message={t('founding.empty')} />;

  return (
    <Screen edges={['top', 'bottom']}>
      <FlatList
        data={vendors.data ?? []}
        keyExtractor={(vendor) => vendor.slug}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const name = localized(item.name, locale);
          const details = [item.category && localized(item.category, locale), item.city]
            .filter(Boolean)
            .join(' · ');
          return (
            <Card
              onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: item.slug } })}
              accessibilityLabel={t('founding.rowSpoken', {
                number: item.foundingNumber,
                name,
                details,
              })}
              style={styles.row}
            >
              <View style={styles.number}>
                <AppText variant="heading" color="kesari" style={styles.tabular}>
                  {`#${item.foundingNumber}`}
                </AppText>
              </View>
              <View style={styles.text}>
                <AppText variant="bodyLg" weight={700}>
                  {name}
                </AppText>
                <AppText color="text2">{details}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={Sizes.icon * scale} color={Colors.text2} />
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  header: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  row: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  number: {
    minWidth: Sizes.iconCircle,
    height: Sizes.iconCircle,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Colors.bg,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
  },
});
