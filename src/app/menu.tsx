import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { MenuDetails } from '@/components/menu-details';
import { Screen } from '@/components/screen';
import { SheetHeader } from '@/components/sheet-header';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useVendorMenus } from '@/data/vendor-menus';
import { useLocale } from '@/i18n/locale-context';

/**
 * One of a vendor's menus in full, as a sheet over the profile (or a chat):
 * name, price, minimum, diet tags, then every section and item.
 * /menu?vendorId={id}&menuId={id}
 */
export default function MenuSheet() {
  const { vendorId = '', menuId = '' } = useLocalSearchParams<{
    vendorId: string;
    menuId: string;
  }>();
  const { t } = useLocale();
  const menus = useVendorMenus(vendorId);
  const menu = menus.data?.find((m) => m.id === menuId);

  let content;
  if (menus.isPending) content = <StateView state="loading" />;
  else if (menus.isError)
    content = <StateView state="error" onRetry={() => void menus.refetch()} />;
  else if (!menu) {
    content = <StateView state="empty" icon="restaurant-outline" message={t('menus.notFound')} />;
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.content}>
        <MenuDetails menu={menu} />
      </ScrollView>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <SheetHeader onClose={() => router.canGoBack() && router.back()} />
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
});
