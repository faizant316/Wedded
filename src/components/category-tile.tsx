import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { BilingualName } from '@/components/bilingual-name';
import { Card } from '@/components/card';
import { IconTile } from '@/components/icon-tile';
import { Sizes, Spacing } from '@/constants/theme';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CategoryTileProps = {
  /** The category's name from the database. */
  name: LocalizedText;
  /** Vendors in this category, e.g. 9. */
  vendorCount?: number;
  /** Whether the count is limited to the user's distance ("9 near you") or
   * everywhere ("9 vendors"). Pass false when no location is set. */
  nearYou?: boolean;
  /** Icon in the circle; a shop front when left out. */
  icon?: IoniconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * One vendor category: icon in a marigold tile, the name in both scripts, and
 * a count. Made for a two-column grid (give each tile `flex: 1`); it grows
 * taller rather than clipping when names wrap.
 */
export function CategoryTile({
  name,
  vendorCount,
  nearYou = true,
  icon = 'storefront-outline',
  onPress,
  style,
}: CategoryTileProps) {
  const { locale, t } = useLocale();
  const { primary } = bilingual(name, locale);
  const count =
    vendorCount === undefined
      ? undefined
      : t(nearYou ? 'counts.nearYou' : 'counts.vendors', { count: vendorCount });

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={count ? `${primary.text}, ${count}` : primary.text}
      accessibilityLanguage={primary.lang}
      style={[styles.card, style]}
    >
      <IconTile icon={icon} />
      <BilingualName name={name} />
      {count && (
        <AppText variant="label" color="text2">
          {count}
        </AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: Sizes.tile,
    gap: Spacing.sm,
  },
});
