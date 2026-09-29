import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppText, useFontScale } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { groupIcon } from '@/components/group-icon';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useSavedEventsFor, useSaveVendor } from '@/data/saved';
import { useVendorLinks, type LinkedVendor } from '@/data/vendor-links';
import { useRealWeddingsAt, useVendorPhotos, type VendorPhoto } from '@/data/vendor-media';
import { useVendor } from '@/data/vendors';
import { bilingual, localized, vendorText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { ALL_NORCAL_MILES, factLabels, priceLine } from '@/features/vendors/profile-format';
import { formatPhone } from '@/lib/phone';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Other vendors linked to this one (approved caterers, venues that approved
 * them, worked with), each opening their own profile. Nothing when empty.
 */
function LinkedVendors({ title, vendors }: { title: string; vendors: LinkedVendor[] }) {
  const router = useRouter();
  const { locale } = useLocale();
  const scale = useFontScale('body');
  if (vendors.length === 0) return null;

  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {vendors.map((linked) => {
        const name = localized(linked.name, locale);
        return (
          <Card
            key={linked.id}
            onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: linked.slug } })}
            accessibilityLabel={`${name}, ${linked.city}`}
            style={styles.linkRow}
          >
            <View style={styles.lineText}>
              <AppText variant="bodyLg" weight={700}>
                {name}
              </AppText>
              <AppText color="text2">{linked.city}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={Sizes.icon * scale} color={Colors.text2} />
          </Card>
        );
      })}
    </View>
  );
}

/** Three square photos per row (vision doc S9 item 10), with credits read out. */
function PhotoGrid({ vendorId, photos }: { vendorId: string; photos: VendorPhoto[] }) {
  const { t } = useLocale();
  const router = useRouter();
  const rows: VendorPhoto[][] = [];
  for (let i = 0; i < photos.length; i += 3) rows.push(photos.slice(i, i + 3));

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0].id} style={styles.gridRow}>
          {row.map((photo) => {
            const index = photos.indexOf(photo);
            return (
              <Pressable
                key={photo.id}
                accessibilityRole="imagebutton"
                accessibilityLabel={t('gallery.open', {
                  number: index + 1,
                  total: photos.length,
                })}
                onPress={() =>
                  router.push({ pathname: '/gallery', params: { vendorId, index: String(index) } })
                }
                style={styles.gridPhoto}
              >
                <Image
                  source={{ uri: photo.url.small }}
                  placeholder={photo.blurhash ? { blurhash: photo.blurhash } : undefined}
                  contentFit="cover"
                  accessible={false}
                  style={styles.gridImage}
                />
              </Pressable>
            );
          })}
          {Array.from({ length: 3 - row.length }, (_, i) => (
            <View key={`gap-${i}`} style={styles.gridPhoto} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** S9 Vendor profile. Deep link: /v/{slug}. Opens over the tabs. */
export default function VendorProfileScreen() {
  // `event` is set when they came from an event, so Save and Ask use it.
  const { slug = '', event } = useLocalSearchParams<{ slug: string; event?: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const scale = useFontScale('body');
  const vendor = useVendor(slug);
  const links = useVendorLinks(vendor.data?.id ?? '');
  const photos = useVendorPhotos(vendor.data?.id ?? '');
  const realWeddings = useRealWeddingsAt(vendor.data?.id ?? '');
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
    // Halls, gurdwaras and other venues take visits before booking (demo step 3).
    const isVenue = v.categories.some((category) => category.groupSlug === 'venues');
    const allPhotos = photos.data ?? [];
    const cover = allPhotos.find((photo) => photo.isCover) ?? allPhotos[0];
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
        {cover ? (
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel={t('gallery.open', { number: 1, total: allPhotos.length })}
            onPress={() =>
              router.push({
                pathname: '/gallery',
                params: { vendorId: v.id, index: String(allPhotos.indexOf(cover)) },
              })
            }
          >
            <Image
              source={{ uri: cover.url.medium }}
              placeholder={cover.blurhash ? { blurhash: cover.blurhash } : undefined}
              contentFit="cover"
              accessible={false}
              style={styles.coverPhoto}
            />
          </Pressable>
        ) : (
          <View style={styles.cover}>
            <Ionicons
              name={groupIcon(v.categories[0]?.groupSlug ?? '')}
              size={Sizes.iconLarge}
              color={Colors.primary}
            />
          </View>
        )}

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

        {isVenue && (
          <Button
            variant="secondary"
            icon="calendar-outline"
            label={t('vendor.bookTour')}
            onPress={() =>
              router.push({
                pathname: '/ask',
                params: event
                  ? { vendorId: v.id, event, kind: 'tour' }
                  : { vendorId: v.id, kind: 'tour' },
              })
            }
          />
        )}

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

        {allPhotos.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.photos')}
            </AppText>
            <PhotoGrid vendorId={v.id} photos={allPhotos} />
          </View>
        )}

        {realWeddings.data && realWeddings.data.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading" accessibilityRole="header">
              {t('vendor.realWeddings')}
            </AppText>
            {realWeddings.data.map((photo) => {
              const by = localized(photo.vendor.name, locale);
              return (
                <Card
                  key={photo.id}
                  onPress={() =>
                    router.push({ pathname: '/v/[slug]', params: { slug: photo.vendor.slug } })
                  }
                  accessibilityLabel={t('vendor.photoBy', { name: by })}
                  style={styles.realWedding}
                >
                  <Image
                    source={{ uri: photo.url.medium }}
                    placeholder={photo.blurhash ? { blurhash: photo.blurhash } : undefined}
                    contentFit="cover"
                    accessible={false}
                    style={styles.realWeddingPhoto}
                  />
                  <View style={styles.realWeddingCaption}>
                    <AppText weight={700} style={styles.lineText}>
                      {t('vendor.photoBy', { name: by })}
                    </AppText>
                    <Ionicons
                      name="chevron-forward"
                      size={Sizes.icon * scale}
                      color={Colors.text2}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {links.data && (
          <>
            <LinkedVendors
              title={t('vendor.approvedCaterers')}
              vendors={links.data.approvedCaterers}
            />
            <LinkedVendors
              title={t('vendor.approvedAt', { count: links.data.approvedAt.length })}
              vendors={links.data.approvedAt}
            />
            <LinkedVendors title={t('vendor.workedWith')} vendors={links.data.workedWith} />
          </>
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

        <Button
          variant="text"
          label={t('vendor.claim')}
          onPress={() => router.push({ pathname: '/for-vendors', params: { claim: v.slug } })}
        />
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
  coverPhoto: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.card,
    backgroundColor: Colors.skeleton,
  },
  grid: {
    gap: Spacing.xs,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  gridPhoto: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Radius.checkbox,
    overflow: 'hidden',
  },
  gridImage: {
    flex: 1,
  },
  realWedding: {
    padding: 0,
  },
  realWeddingPhoto: {
    width: '100%',
    aspectRatio: 3 / 2,
    backgroundColor: Colors.skeleton,
  },
  realWeddingCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
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
  linkRow: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
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
