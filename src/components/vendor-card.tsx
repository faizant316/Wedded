import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/app-text';
import { Card } from '@/components/card';
import { Colors, Sizes, Spacing } from '@/constants/theme';
import { localized, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

export type PriceUnit = 'event' | 'hour' | 'person' | 'plate' | 'hand' | 'turban' | 'day';

export type VendorCardProps = {
  /** The business name; `pa` is shown in Punjabi mode when the vendor has one. */
  name: LocalizedText;
  /** The vendor's main category, from the database. */
  category: LocalizedText;
  /** Where they're based, e.g. "Tracy, CA". Never a street address. */
  city: string;
  /** Distance from the user; leave out when no location is set. */
  distanceMiles?: number | null;
  /** Their lowest advertised price in whole US dollars, and what it's for. */
  startingPrice?: { amount: number; unit?: PriceUnit } | null;
  /** Cover photo; cropped to 3:2. */
  photoUrl?: string | null;
  /** Opens the profile. Without it the card is display-only. */
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Prices keep Latin digits in both languages (vision doc section 4).
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * A vendor in a list: 3:2 cover photo, name, "Dhol · Tracy, CA · 31 mi" and
 * "From $450 / event". The whole card opens the profile; there's deliberately
 * no Call button on cards.
 */
export function VendorCard({
  name,
  category,
  city,
  distanceMiles,
  startingPrice,
  photoUrl,
  onPress,
  style,
}: VendorCardProps) {
  const { locale, t } = useLocale();

  let distance: { shown: string; spoken: string } | undefined;
  if (distanceMiles != null) {
    distance =
      distanceMiles < 1
        ? { shown: t('vendorCard.underOneMile'), spoken: t('vendorCard.underOneMileSpoken') }
        : {
            shown: t('vendorCard.miles', { count: Math.round(distanceMiles) }),
            spoken: t('vendorCard.milesSpoken', { count: Math.round(distanceMiles) }),
          };
  }

  let price: { shown: string; spoken: string } | undefined;
  if (startingPrice) {
    const amount = usd.format(startingPrice.amount);
    if (startingPrice.unit) {
      const unit = t(`vendorCard.units.${startingPrice.unit}`);
      price = {
        shown: t('vendorCard.fromPer', { price: amount, unit }),
        spoken: t('vendorCard.fromPerSpoken', { price: amount, unit }),
      };
    } else {
      const text = t('vendorCard.from', { price: amount });
      price = { shown: text, spoken: text };
    }
  }

  const vendorName = localized(name, locale);
  const categoryName = localized(category, locale);
  // Non-breaking spaces keep "31 mi" together when the line wraps.
  const details = [categoryName, city, distance?.shown.replace(/ /g, '\u00a0')]
    .filter(Boolean)
    .join(' · ');
  const spoken = [vendorName, categoryName, city, distance?.spoken, price?.spoken]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} accessible accessibilityLabel={spoken} style={[styles.card, style]}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          contentFit="cover"
          accessible={false}
          style={styles.photo}
        />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Ionicons name="image-outline" size={Sizes.iconLarge} color={Colors.textDisabled} />
        </View>
      )}
      <View style={styles.body}>
        <AppText variant="bodyLg" weight={700}>
          {vendorName}
        </AppText>
        <AppText color="text2">{details}</AppText>
        {price && (
          <AppText weight={700} style={styles.price}>
            {price.shown}
          </AppText>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  photo: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: Colors.skeleton,
  },
  noPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: Spacing.xs,
    padding: Spacing.lg,
  },
  price: {
    fontVariant: ['tabular-nums'],
  },
});
