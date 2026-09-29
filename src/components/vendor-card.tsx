import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Card } from '@/components/card';
import { Colors, Elevation, gradient, Gradients, Radius, Sizes, Spacing } from '@/constants/theme';
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
  /** Shows the "Founding vendor" badge. */
  foundingNumber?: number | null;
  /** Shows "Travels to you": based outside your distance, but they cover your area. */
  travelsToYou?: boolean;
  /** Filled heart when true. */
  saved?: boolean;
  /** Shows the heart; the caller saves or removes (useSaveVendor().toggleSave). */
  onToggleSave?: () => void;
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
  foundingNumber,
  travelsToYou = false,
  saved = false,
  onToggleSave,
  onPress,
  style,
}: VendorCardProps) {
  const { locale, t } = useLocale();
  const scale = useFontScale('label');

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
  const saveLabel = saved
    ? t('vendorCard.unsave', { name: vendorName })
    : t('vendorCard.save', { name: vendorName });
  const badges: { key: string; label: string; icon: 'ribbon-outline' | 'car-outline' }[] = [];
  if (foundingNumber != null) {
    badges.push({ key: 'founding', label: t('vendorCard.founding'), icon: 'ribbon-outline' });
  }
  if (travelsToYou) {
    badges.push({ key: 'travels', label: t('vendorCard.travelsToYou'), icon: 'car-outline' });
  }
  const spoken = [
    vendorName,
    categoryName,
    city,
    distance?.spoken,
    ...badges.map((badge) => badge.label),
    price?.spoken,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      onPress={onPress}
      accessible
      accessibilityLabel={spoken}
      // The heart sits inside the card, which screen readers treat as one
      // element, so saving is also offered as an action on the card.
      accessibilityActions={onToggleSave ? [{ name: 'toggleSave', label: saveLabel }] : undefined}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'toggleSave') onToggleSave?.();
      }}
      style={[styles.card, style]}
    >
      <View>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            contentFit="cover"
            accessible={false}
            style={styles.photo}
          />
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Ionicons name="image-outline" size={Sizes.iconLarge} color={Colors.kesari} />
          </View>
        )}
        {badges.length > 0 && <View style={styles.scrim} pointerEvents="none" />}
        {onToggleSave && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saveLabel}
            onPress={onToggleSave}
            style={({ pressed }) => [styles.heart, pressed && styles.heartPressed]}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={Sizes.icon}
              color={Colors.primary}
            />
          </Pressable>
        )}
        {badges.length > 0 && (
          <View style={styles.badges}>
            {badges.map((badge) => (
              <View key={badge.key} style={styles.badge}>
                <Ionicons
                  name={badge.icon}
                  size={Sizes.iconSmall * scale}
                  color={badge.key === 'founding' ? Colors.kesari : Colors.text}
                />
                <AppText
                  variant="label"
                  weight={700}
                  color={badge.key === 'founding' ? 'kesari' : 'text'}
                >
                  {badge.label}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.body}>
        <AppText variant="bodyLg" weight={800}>
          {vendorName}
        </AppText>
        <AppText color="text2">{details}</AppText>
        {price && (
          <AppText weight={800} color="primary" style={styles.price}>
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
    ...gradient(Gradients.iconWash),
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    ...gradient(Gradients.photoScrim),
  },
  heart: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Colors.surface,
    boxShadow: Elevation.raised,
  },
  heartPressed: {
    backgroundColor: Colors.primaryTint,
  },
  badges: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    bottom: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
    boxShadow: Elevation.card,
  },
  body: {
    gap: Spacing.xs,
    padding: Spacing.lg,
  },
  price: {
    fontVariant: ['tabular-nums'],
  },
});
