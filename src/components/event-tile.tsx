import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { BilingualName } from '@/components/bilingual-name';
import { Card } from '@/components/card';
import { Colors, gradient, Gradients, Sizes, Spacing } from '@/constants/theme';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

export type EventTileProps = {
  /** The event's name from the database. */
  name: LocalizedText;
  /** How many kinds of vendor the event needs, e.g. 9. */
  vendorTypeCount?: number;
  /** How many vendors serve the event, e.g. 42. */
  vendorCount?: number;
  /** A real photo from the event, when there is one. */
  photoUrl?: string | null;
  /** Opens the event. Without it the tile is display-only: no chevron, not tappable. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * One event on Home: full width, the name in both scripts, then
 * "9 vendor types · 42 vendors". Callers keep the database's ceremony order.
 */
export function EventTile({
  name,
  vendorTypeCount,
  vendorCount,
  photoUrl,
  onPress,
  style,
}: EventTileProps) {
  const { locale, t } = useLocale();
  const scale = useFontScale('body');
  const { primary } = bilingual(name, locale);
  const counts = [
    vendorTypeCount === undefined ? null : t('counts.vendorTypes', { count: vendorTypeCount }),
    vendorCount === undefined ? null : t('counts.vendors', { count: vendorCount }),
  ].filter((part) => part !== null);

  return (
    <Card
      onPress={onPress}
      accessible
      accessibilityLabel={[primary.text, ...counts].join(', ')}
      accessibilityLanguage={primary.lang}
      style={[styles.card, !!photoUrl && styles.withPhoto, style]}
    >
      {!photoUrl && <View style={styles.accent} />}
      {photoUrl && (
        <Image
          source={{ uri: photoUrl }}
          contentFit="cover"
          accessible={false}
          style={styles.photo}
        />
      )}
      <View style={styles.text}>
        <BilingualName name={name} />
        {counts.length > 0 && (
          <AppText variant="label" color="text2">
            {counts.join(' · ')}
          </AppText>
        )}
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={Sizes.icon * scale}
          color={Colors.text2}
          style={styles.chevron}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: Sizes.eventTile,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  withPhoto: {
    minHeight: Sizes.eventTilePhoto,
  },
  photo: {
    width: Sizes.eventPhoto,
    alignSelf: 'stretch',
    backgroundColor: Colors.skeleton,
  },
  // A marigold-to-saffron edge on cards without a photo.
  accent: {
    width: Spacing.sm,
    alignSelf: 'stretch',
    ...gradient(Gradients.eventEdge),
  },
  text: {
    flex: 1,
    gap: Spacing.xs,
    padding: Spacing.lg,
  },
  chevron: {
    marginRight: Spacing.lg,
  },
});
