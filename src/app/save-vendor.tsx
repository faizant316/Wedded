import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BilingualName } from '@/components/bilingual-name';
import { FieldError } from '@/components/field-error';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useHomeEvents } from '@/data/reference';
import { useSavedEventsFor, useSaveVendor } from '@/data/saved';
import type { LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * "Save to which event?" (vision §6: Save, then "Save to which event?").
 * Opened as a modal by useSaveVendor().toggleSave when there's no event
 * context, e.g. from Search or a vendor profile. `?vendorId=` is required.
 */
export default function SaveVendorScreen() {
  const { t } = useLocale();
  const { vendorId = '' } = useLocalSearchParams<{ vendorId?: string }>();
  const events = useHomeEvents();
  const savedFor = useSavedEventsFor(vendorId);
  const { saveFor, saving } = useSaveVendor();
  const [error, setError] = useState<string>();

  async function choose(eventSlug: string | null) {
    setError(undefined);
    try {
      await saveFor({ vendorId, eventSlug });
      if (router.canGoBack()) router.back();
    } catch {
      setError(t('saved.saveFailed'));
    }
  }

  let content;
  if (!vendorId || events.isError) {
    content = <StateView state="error" onRetry={vendorId ? () => events.refetch() : undefined} />;
  } else if (events.isPending) {
    content = <StateView state="loading" />;
  } else {
    const options: { slug: string | null; name: LocalizedText }[] = [
      ...events.data.flatMap((section) => section.events),
      { slug: null, name: { en: t('saved.notSure') } },
    ];
    content = (
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" accessibilityRole="header">
          {t('saveVendor.title')}
        </AppText>
        <AppText color="text2">{t('saveVendor.subtitle')}</AppText>
        {error && <FieldError message={error} />}
        {options.map((option) => {
          const alreadySaved = savedFor.includes(option.slug);
          return (
            <Pressable
              key={option.slug ?? 'not-sure'}
              accessibilityRole="button"
              accessibilityState={{ disabled: alreadySaved || saving, selected: alreadySaved }}
              disabled={alreadySaved || saving}
              onPress={() => choose(option.slug)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.rowName}>
                <BilingualName name={option.name} />
              </View>
              {alreadySaved ? (
                <View style={styles.saved}>
                  <Ionicons name="heart" size={Sizes.iconSmall} color={Colors.pink} />
                  <AppText variant="label" color="text2">
                    {t('saveVendor.alreadySaved')}
                  </AppText>
                </View>
              ) : (
                <Ionicons name="heart-outline" size={Sizes.icon} color={Colors.primary} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('signIn.close')}
          onPress={() => router.canGoBack() && router.back()}
          style={({ pressed }) => [styles.close, pressed && styles.rowPressed]}
        >
          <Ionicons name="close" size={Sizes.icon + 4} color={Colors.text} />
        </Pressable>
      </View>
      {content}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Spacing.sm,
  },
  close: {
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.tapTarget / 2,
  },
  content: {
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.card,
    borderWidth: BorderWidth.hairline,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  rowPressed: {
    backgroundColor: Colors.primaryTint,
  },
  rowName: {
    flex: 1,
  },
  saved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
