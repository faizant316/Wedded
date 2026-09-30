import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/app-text';
import { FieldError } from '@/components/field-error';
import { MenuCard } from '@/components/menu-card';
import { Screen } from '@/components/screen';
import { SheetHeader } from '@/components/sheet-header';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { sendErrorKind, useSendMessage } from '@/data/chat';
import { useVendorMenus } from '@/data/vendor-menus';
import { useLocale } from '@/i18n/locale-context';

/**
 * For a vendor in a chat: pick one of your menus to send as a card.
 * /chat-menu?id={conversation id}&vendorId={vendor id}
 */
export default function ChatMenuSheet() {
  const { id = '', vendorId = '' } = useLocalSearchParams<{ id: string; vendorId: string }>();
  const { t } = useLocale();
  const menus = useVendorMenus(vendorId);
  const send = useSendMessage(id);

  let body;
  if (menus.isPending) body = <StateView state="loading" />;
  else if (menus.isError) body = <StateView state="error" onRetry={() => void menus.refetch()} />;
  else if (menus.data.length === 0) {
    body = (
      <StateView state="empty" icon="restaurant-outline" message={t('chat.menuPicker.none')} />
    );
  } else {
    body = menus.data.map((menu) => (
      <MenuCard
        key={menu.id}
        menu={menu}
        onPress={() =>
          send.mutate({ kind: 'menu', menuId: menu.id }, { onSuccess: () => router.back() })
        }
      />
    ));
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <SheetHeader onClose={() => router.canGoBack() && router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" accessibilityRole="header">
          {t('chat.menuPicker.title')}
        </AppText>
        <AppText color="text2">{t('chat.menuPicker.hint')}</AppText>
        {send.isError && <FieldError message={t(`chat.errors.${sendErrorKind(send.error)}`)} />}
        {body}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
});
