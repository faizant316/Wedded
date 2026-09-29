import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useFontScale } from '@/components/app-text';
import { BilingualName } from '@/components/bilingual-name';
import { Card } from '@/components/card';
import { IconTile } from '@/components/icon-tile';
import { Colors, Sizes, Spacing } from '@/constants/theme';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CategoryRowProps = {
  /** The category's name from the database. */
  name: LocalizedText;
  /** Icon in the circle; a shop front when left out. */
  icon?: IoniconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * One category as a full-width row (vision doc S5, "Vendors you'll need"):
 * icon in a marigold tile, the name in both scripts, and a chevron.
 */
export function CategoryRow({
  name,
  icon = 'storefront-outline',
  onPress,
  style,
}: CategoryRowProps) {
  const { locale } = useLocale();
  const scale = useFontScale('body');
  const { primary } = bilingual(name, locale);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={primary.text}
      accessibilityLanguage={primary.lang}
      style={[styles.row, style]}
    >
      <IconTile icon={icon} />
      <View style={styles.name}>
        <BilingualName name={name} />
      </View>
      <Ionicons name="chevron-forward" size={Sizes.icon * scale} color={Colors.text2} />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  name: {
    flex: 1,
  },
});
