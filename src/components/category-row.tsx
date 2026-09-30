import { ListRow } from '@/components/list';
import type { IconName } from '@/components/icon';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

export type CategoryRowProps = {
  /** The category's name from the database. */
  name: LocalizedText;
  /** A line of detail, e.g. "9 vendors"; shown after the other script. */
  detail?: string;
  /** Glyph at the start of the row; a shop front when left out, none with null. */
  icon?: IconName | null;
  onPress: () => void;
};

/**
 * One category, group or event as a row of a ListSection (vision doc S5,
 * "Vendors you'll need"): the app-colour glyph, the name in both scripts, a
 * chevron. Put rows with icons inside `<ListSection inset>`.
 */
export function CategoryRow({
  name,
  detail,
  icon = 'storefront-outline',
  onPress,
}: CategoryRowProps) {
  const { locale } = useLocale();
  const { primary, secondary } = bilingual(name, locale);
  const subtitle = [secondary?.text, detail].filter(Boolean).join(' · ');

  return (
    <ListRow
      title={primary.text}
      titleLang={primary.lang}
      titleVariant="bodyLg"
      subtitle={subtitle || undefined}
      subtitleLang={secondary && !detail ? secondary.lang : undefined}
      icon={icon ?? undefined}
      accessibilityLabel={[primary.text, detail].filter(Boolean).join(', ')}
      onPress={onPress}
    />
  );
}
