import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppText, useFontScale } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/button';
import { groupIcon } from '@/components/group-icon';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useSavedEventsFor, useSaveVendor } from '@/data/saved';
import { useVendor, type HallFacts, type VendorPrice } from '@/data/vendors';
import { bilingual, localized, vendorText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { formatPhone } from '@/lib/phone';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Translate = (key: string, options?: Record<string, string | number>) => string;

// Prices keep Latin digits in both languages (vision doc section 4).
const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// service_radius_miles uses 250 for "all of Northern California".
const ALL_NORCAL_MILES = 250;

function priceLine(price: VendorPrice, t: Translate): string {
  switch (price.kind) {
    case 'starting_at':
      return price.unit
        ? t('vendorCard.fromPer', {
            price: usd.format(price.amount),
            unit: t(`vendorCard.units.${price.unit}`),
          })
        : t('vendorCard.from', { price: usd.format(price.amount) });
    case 'range':
      return price.unit
        ? t('vendor.priceRangePer', {
            from: usd.format(price.from),
            to: usd.format(price.to),
            unit: t(`vendorCard.units.${price.unit}`),
          })
        : t('vendor.priceRange', { from: usd.format(price.from), to: usd.format(price.to) });
    case 'packages':
      return t('vendor.pricePackages');
    case 'contact':
      return t('vendor.priceContact');
  }
}

/** "01:00" → "1:00 AM", keeping Latin digits. */
function formatTime(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!match) return hhmm;
  const hours = Number(match[1]);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${match[2]} ${suffix}`;
}

/** Hall fact chips (vision doc S9 item 9); a value the app doesn't know is skipped. */
function factLabels(facts: HallFacts, t: Translate): string[] {
  const labels: string[] = [];
  if (facts.seatedCapacity) labels.push(t('vendor.facts.seats', { count: facts.seatedCapacity }));
  if (facts.outsideCatering === 'yes') labels.push(t('vendor.facts.outsideCateringYes'));
  if (facts.outsideCatering === 'approved_list') {
    labels.push(t('vendor.facts.outsideCateringList'));
  }
  if (facts.outsideCatering === 'no') labels.push(t('vendor.facts.outsideCateringNo'));
  if (facts.alcoholPolicy === 'byob') {
    labels.push(
      facts.corkage
        ? t('vendor.facts.byobCorkage', { price: usd.format(facts.corkage) })
        : t('vendor.facts.byob'),
    );
  }
  if (facts.alcoholPolicy === 'full_bar') labels.push(t('vendor.facts.fullBar'));
  if (facts.alcoholPolicy === 'none') labels.push(t('vendor.facts.noAlcohol'));
  if (facts.ghoriAllowed === true) labels.push(t('vendor.facts.ghoriYes'));
  if (facts.ghoriAllowed === false) labels.push(t('vendor.facts.ghoriNo'));
  if (facts.curfew) labels.push(t('vendor.facts.curfew', { time: formatTime(facts.curfew) }));
  if (facts.parkingSpaces) {
    labels.push(t('vendor.facts.parking', { count: facts.parkingSpaces }));
  }
  return labels;
}

/** S9 Vendor profile. Deep link: /v/{slug}. Opens over the tabs. */
export default function VendorProfileScreen() {
  // `event` is set when they came from an event, so Save and Ask use it.
  const { slug = '', event } = useLocalSearchParams<{ slug: string; event?: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const scale = useFontScale('body');
  const vendor = useVendor(slug);
  const { toggleSave } = useSaveVendor();
  const saved = useSavedEventsFor(vendor.data?.id ?? '').length > 0;

  const open = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert(t('vendor.openFailed')));
  };

  let body;
  if (vendor.isPending) {
    body = <StateView state="loading" />;
  } else if (vendor.isError) {
    body = <StateView state="error" onRetry={() => void vendor.refetch()} />;
  } else if (!vendor.data) {
    body = (
      <StateView
        state="empty"
        icon="storefront-outline"
        message={t('vendor.notFound')}
        action={{ label: t('common.goHome'), onPress: () => router.navigate('/') }}
      />
    );
  } else {
    const v = vendor.data;
    const { primary, secondary } = bilingual(v.name, locale);
    const name = primary.text;
    const tagline = vendorText(v.tagline.en, v.tagline.pa, locale);
    const bio = vendorText(v.bio.en, v.bio.pa, locale);
    const facts = factLabels(v.facts, t);
    const languages = v.languages
      .map((code) => t(`vendor.languages.${code}`, { defaultValue: code }))
      .join(', ');

    const actions: {
      key: string;
      icon: IoniconName;
      label: string;
      spoken: string;
      onPress: () => void;
    }[] = [];
    if (v.callPhone) {
      const phone = v.callPhone;
      actions.push({
        key: 'call',
        icon: 'call-outline',
        label: t('vendor.call'),
        spoken: t('vendor.callSpoken', { name, phone: formatPhone(phone) }),
        // A confirm sheet showing the number prevents pocket calls (vision S9).
        onPress: () =>
          Alert.alert(t('vendor.callTitle', { name }), formatPhone(phone), [
            { text: t('vendor.cancel'), style: 'cancel' },
            { text: t('vendor.call'), onPress: () => open(`tel:${phone}`) },
          ]),
      });
    }
    if (v.textPhone) {
      actions.push({
        key: 'text',
        icon: 'chatbubble-outline',
        label: t('vendor.text'),
        spoken: t('vendor.textSpoken', { name, phone: formatPhone(v.textPhone) }),
        onPress: () => open(`sms:${v.textPhone}`),
      });
    }
    if (v.whatsappPhone) {
      actions.push({
        key: 'whatsapp',
        icon: 'logo-whatsapp',
        label: t('vendor.whatsapp'),
        spoken: t('vendor.whatsappSpoken', { name }),
        onPress: () => open(`https://wa.me/${v.whatsappPhone?.replace(/\D/g, '')}`),
      });
    }
    if (v.instagramHandle) {
      actions.push({
        key: 'instagram',
        icon: 'logo-instagram',
        label: t('vendor.instagram'),
        spoken: t('vendor.instagramSpoken', { name }),
        onPress: () => open(`https://instagram.com/${v.instagramHandle}`),
      });
    }
    if (v.addressLine) {
      const destination = encodeURIComponent(v.addressLine);
      actions.push({
        key: 'directions',
        icon: 'navigate-outline',
        label: t('vendor.directions'),
        spoken: t('vendor.directionsSpoken', { name }),
        onPress: () =>
          open(
            Platform.OS === 'ios'
              ? `https://maps.apple.com/?daddr=${destination}`
              : `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
          ),
      });
    }

    // Printed out as well as behind buttons: elders often read a number aloud
    // to someone else (vision S9 item 12).
    const contacts: { label: string; value: string }[] = [];
    if (v.callPhone) contacts.push({ label: t('vendor.phone'), value: formatPhone(v.callPhone) });
    if (v.textPhone && v.textPhone !== v.callPhone) {
      contacts.push({ label: t('vendor.text'), value: formatPhone(v.textPhone) });
    }
    if (v.whatsappPhone) {
      contacts.push({ label: t('vendor.whatsapp'), value: formatPhone(v.whatsappPhone) });
    }
    if (v.instagramHandle) {
      contacts.push({ label: t('vendor.instagram'), value: `@${v.instagramHandle}` });
    }
    if (v.websiteUrl) contacts.push({ label: t('vendor.website'), value: v.websiteUrl });

    body = (
      <>
        <View style={styles.cover}>
          <Ionicons
            name={groupIcon(v.categories[0]?.groupSlug ?? '')}
            size={Sizes.iconLarge}
            color={Colors.primary}
          />
        </View>

        <View>
          <AppText variant="title" lang={primary.lang} accessibilityRole="header">
            {primary.text}
          </AppText>
          {secondary && (
            <AppText variant="bodyLg" color="text2" lang={secondary.lang}>
              {secondary.text}
            </AppText>
          )}
        </View>

        {v.foundingNumber != null && (
          <View style={styles.founding}>
            <Ionicons name="ribbon-outline" size={Sizes.iconSmall * scale} color={Colors.kesari} />
            <AppText weight={700} color="kesari">
              {t('vendor.foundingNumber', { number: v.foundingNumber })}
            </AppText>
          </View>
        )}

        {v.categories.length > 0 && (
          <View style={styles.pills}>
            {v.categories.map((category) => (
              <View key={category.slug} style={styles.pill}>
                <AppText variant="label">{localized(category.name, locale)}</AppText>
              </View>
            ))}
          </View>
        )}

        {tagline && <AppText variant="bodyLg">{tagline}</AppText>}

        <View style={styles.lines}>
          <View style={styles.line}>
            <Ionicons name="location-outline" size={Sizes.icon * scale} color={Colors.text2} />
            <AppText style={styles.lineText}>
              {v.addressLine ?? t('vendor.basedIn', { city: v.city })}
            </AppText>
          </View>
          {!v.addressLine && (
            <View style={styles.line}>
              <Ionicons name="car-outline" size={Sizes.icon * scale} color={Colors.text2} />
              <AppText style={styles.lineText}>
                {v.serviceRadiusMiles >= ALL_NORCAL_MILES
                  ? t('vendor.travelsNorcal')
                  : t('vendor.travelsUpTo', { miles: v.serviceRadiusMiles })}
                {v.willTravel && v.travelNote ? ` ${v.travelNote}` : ''}
              </AppText>
            </View>
          )}
          {languages.length > 0 && (
            <View style={styles.line}>
              <Ionicons name="language-outline" size={Sizes.icon * scale} color={Colors.text2} />
              <AppText style={styles.lineText}>{t('vendor.speaks', { languages })}</AppText>
            </View>
          )}
        </View>

        {v.price && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.price')}
            </AppText>
            <AppText variant="bodyLg" weight={700} style={styles.tabular}>
              {priceLine(v.price, t)}
            </AppText>
            {v.priceNote && <AppText>{v.priceNote}</AppText>}
            {(v.price.kind === 'starting_at' || v.price.kind === 'range') && (
              <AppText variant="label" color="text2">
                {t('vendor.priceCaption')}
              </AppText>
            )}
          </View>
        )}

        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action) => (
              <ActionButton
                key={action.key}
                icon={action.icon}
                label={action.label}
                accessibilityLabel={action.spoken}
                onPress={action.onPress}
              />
            ))}
          </View>
        )}

        {facts.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.goodToKnow')}
            </AppText>
            <View style={styles.pills}>
              {facts.map((fact) => (
                <View key={fact} style={styles.pill}>
                  <AppText variant="label">{fact}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {bio && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.about')}
            </AppText>
            <AppText variant="bodyLg">{bio}</AppText>
          </View>
        )}

        {contacts.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.contact')}
            </AppText>
            {contacts.map((line) => (
              <AppText key={line.label} selectable>
                <AppText weight={700}>{line.label}: </AppText>
                {line.value}
              </AppText>
            ))}
          </View>
        )}
      </>
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton />
        {body}
      </ScrollView>
      {vendor.data && (
        <View style={styles.bottomBar}>
          <Button
            variant="secondary"
            icon={saved ? 'heart' : 'heart-outline'}
            label={saved ? t('vendor.saved') : t('vendor.save')}
            onPress={() => vendor.data && toggleSave(vendor.data.id, event)}
            style={styles.save}
          />
          <Button
            label={t('vendor.ask')}
            onPress={() =>
              vendor.data &&
              router.push({
                pathname: '/ask',
                params: event ? { vendorId: vendor.data.id, event } : { vendorId: vendor.data.id },
              })
            }
            style={styles.ask}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  cover: {
    height: Sizes.cover,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.card,
    backgroundColor: Colors.primaryTint,
  },
  founding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.chip,
    borderWidth: BorderWidth.hairline,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  lines: {
    gap: Spacing.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lineText: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: Spacing.md,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: BorderWidth.hairline,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  // Save 40 percent, Ask 60 percent (vision doc S9).
  save: {
    flex: 2,
  },
  ask: {
    flex: 3,
  },
});
