import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { CategoryRow } from '@/components/category-row';
import { IconLine } from '@/components/icon-line';
import { groupIcon } from '@/components/group-icon';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useEvent, useEventNeeds } from '@/data/reference';
import { bilingual, localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

// Headings for event_categories.importance; anything new shows without one.
const IMPORTANCE_HEADINGS: Partial<Record<string, string>> = {
  essential: 'event.essential',
  nice_to_have: 'event.niceToHave',
};

/** S5 Event page: what the event is and the vendors it needs. Deep link: /e/{slug}. */
export default function EventScreen() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const event = useEvent(slug);
  const needs = useEventNeeds(slug);

  const retry = () => {
    void event.refetch();
    void needs.refetch();
  };

  let body;
  if (event.isPending || needs.isPending) {
    body = <StateView state="loading" />;
  } else if (event.isError || needs.isError) {
    body = <StateView state="error" onRetry={retry} />;
  } else if (!event.data) {
    body = (
      <StateView
        state="empty"
        icon="calendar-outline"
        message={t('event.notFound')}
        action={{ label: t('common.goHome'), onPress: () => router.navigate('/') }}
      />
    );
  } else {
    const { primary, secondary } = bilingual(event.data.name, locale);
    body = (
      <>
        <View>
          <AppText variant="display" lang={primary.lang} accessibilityRole="header">
            {primary.text}
          </AppText>
          {secondary && (
            <AppText variant="bodyLg" color="text2" lang={secondary.lang}>
              {secondary.text}
            </AppText>
          )}
        </View>

        {event.data.timing && (
          <IconLine icon="time-outline" color="text2">
            {localized(event.data.timing, locale)}
          </IconLine>
        )}
        {event.data.summary && (
          <AppText variant="bodyLg">{localized(event.data.summary, locale)}</AppText>
        )}

        <AppText variant="title" accessibilityRole="header" style={styles.needsTitle}>
          {t('event.needsTitle')}
        </AppText>
        {needs.data.map((section) => {
          const heading = IMPORTANCE_HEADINGS[section.importance];
          return (
            <View key={section.importance} style={styles.section}>
              {heading && (
                <AppText variant="heading" accessibilityRole="header">
                  {t(heading)}
                </AppText>
              )}
              {section.needs.map((need) => (
                <CategoryRow
                  key={need.categorySlug}
                  name={need.name}
                  icon={groupIcon(need.groupSlug)}
                  onPress={() =>
                    router.push({
                      pathname: '/c/[category]',
                      params: { category: need.categorySlug, event: slug },
                    })
                  }
                />
              ))}
            </View>
          );
        })}
      </>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton />
        {body}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  needsTitle: {
    marginTop: Spacing.sm,
  },
  section: {
    gap: Spacing.sm,
  },
});
