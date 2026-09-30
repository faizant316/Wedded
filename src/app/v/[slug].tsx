import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppText, useFontScale } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Glass } from '@/components/glass';
import { groupIcon } from '@/components/group-icon';
import { Icon, type IconName } from '@/components/icon';
import { ListRow, ListSection, SectionTitle } from '@/components/list';
import { NavBar, useNavScroll, useNavTop } from '@/components/nav';
import { StateView } from '@/components/state-view';
import { appLink } from '@/constants/links';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useSavedEventsFor, useSaveVendor } from '@/data/saved';
import { useVendorLinks, type LinkedVendor } from '@/data/vendor-links';
import { useRealWeddingsAt, useVendorPhotos, type VendorPhoto } from '@/data/vendor-media';
import { useVendor } from '@/data/vendors';
import { ALL_NORCAL_MILES, factLabels, priceLine } from '@/features/vendors/profile-format';
import { bilingual, localized, vendorText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { saveHaptic } from '@/lib/haptics';
import { formatPhone } from '@/lib/phone';

/**
 * Other vendors linked to this one (approved caterers, venues that approved
 * them, worked with), each opening their own profile. Nothing when empty.
 */
function LinkedVendors({ title, vendors }: { title: string; vendors: LinkedVendor[] }) {
  const router = useRouter();
  const { locale } = useLocale();
  if (vendors.length === 0) return null;

  return (
    <View style={styles.block}>
      <SectionTitle>{title}</SectionTitle>
      <ListSection>
        {vendors.map((linked) => {
          const name = localized(linked.name, locale);
          return (
            <ListRow
              key={linked.id}
              title={name}
              subtitle={linked.city}
              accessibilityLabel={`${name}, ${linked.city}`}
              onPress={() => router.push({ pathname: '/v/[slug]', params: { slug: linked.slug } })}
            />
          );
        })}
      </ListSection>
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
                style={({ pressed }) => [styles.gridPhoto, pressed && styles.dimmed]}
              >
                <Image
                  source={{ uri: photo.url.small }}
                  placeholder={photo.blurhash ? { blurhash: photo.blurhash } : undefined}
                  contentFit="cover"
                  transition={200}
                  accessible={false}
                  style={styles.gridImage}
                />
              </Pressable>
            );
          })}
          {Array.from({ length: 3 - row.length }, (_, i) => (
            <View key={`gap-${i}`} style={styles.gridGap} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * S9 Vendor profile. Deep link: /v/{slug}. Opens over the tabs. The cover
 * photo runs edge to edge under the status bar with the glass Back button
 * floating on it; Save and Ask float in a glass bar at the bottom.
 */
export default function VendorProfileScreen() {
  // `event` is set when they came from an event, so Save and Ask use it.
  const { slug = '', event } = useLocalSearchParams<{ slug: string; event?: string }>();
  const router = useRouter();
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scroll = useNavScroll();
  const navTop = useNavTop();
  const reduceMotion = useReducedMotion();
  // Side by side, a Punjabi "Save" breaks mid-word at very large text sizes.
  const stackButtons = useFontScale('button') >= 1.5;
  const [barHeight, setBarHeight] = useState(0);
  const vendor = useVendor(slug);
  const links = useVendorLinks(vendor.data?.id ?? '');
  const photos = useVendorPhotos(vendor.data?.id ?? '');
  const realWeddings = useRealWeddingsAt(vendor.data?.id ?? '');
  const { toggleSave } = useSaveVendor();
  const saved = useSavedEventsFor(vendor.data?.id ?? '').length > 0;

  // The cover is about a phone's width tall, a little less on wide screens.
  const heroHeight = Math.round(Math.min(width, 480) * 0.82);

  // Pulling down stretches the photo; scrolling up slides it at half speed.
  // Capture only the shared value: the scroll object's onScroll can't go to the UI thread
  const { scrollY } = scroll;
  const heroStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    if (reduceMotion) return {};
    return {
      transform: [
        { translateY: y < 0 ? y / 2 : y * 0.4 },
        { scale: interpolate(y, [-heroHeight, 0], [2, 1], Extrapolation.CLAMP) },
      ],
    };
  });

  // The bar's backdrop and small title arrive as the name scrolls under it.
  // The name's position is measured below the cover, so add the cover back.
  const onTitleLayout = (layout: LayoutChangeEvent, above: number) => {
    const { y, height } = layout.nativeEvent.layout;
    scroll.setCollapseAt(above + y + height - navTop);
  };

  // Alert does nothing in a web browser, so the web uses the browser's own.
  const notify = (message: string) =>
    Platform.OS === 'web' ? globalThis.alert(message) : Alert.alert(message);
  const open = (url: string) => {
    Linking.openURL(url).catch(() => notify(t('vendor.openFailed')));
  };

  let hero = null;
  let body;
  if (vendor.isPending) {
    body = <StateView state="loading" style={{ marginTop: navTop }} />;
  } else if (vendor.isError) {
    body = (
      <StateView
        state="error"
        onRetry={() => void vendor.refetch()}
        style={{ marginTop: navTop }}
      />
    );
  } else if (!vendor.data) {
    body = (
      <StateView
        state="empty"
        icon="storefront-outline"
        message={t('vendor.notFound')}
        action={{ label: t('common.goHome'), onPress: () => router.navigate('/') }}
        style={{ marginTop: navTop }}
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
    const categoryNames = v.categories.map((category) => localized(category.name, locale));

    const actions: {
      key: string;
      icon: IconName;
      label: string;
      spoken: string;
      onPress: () => void;
    }[] = [];
    if (v.callPhone) {
      const phone = v.callPhone;
      actions.push({
        key: 'call',
        icon: 'call',
        label: t('vendor.call'),
        spoken: t('vendor.callSpoken', { name, phone: formatPhone(phone) }),
        // A confirm sheet showing the number prevents pocket calls (vision S9).
        // On the web the phone asks before a tel: link calls, and Alert does
        // nothing there, so the link opens straight away.
        onPress: () =>
          Platform.OS === 'web'
            ? open(`tel:${phone}`)
            : Alert.alert(t('vendor.callTitle', { name }), formatPhone(phone), [
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

    const category = categoryNames[0] ?? null;
    // Without photos, a shorter band with the category's icon.
    const heroBand = cover ? heroHeight : Math.round(heroHeight * 0.7);

    hero = cover ? (
      <Pressable
        accessibilityRole="imagebutton"
        accessibilityLabel={t('gallery.open', { number: 1, total: allPhotos.length })}
        onPress={() =>
          router.push({
            pathname: '/gallery',
            params: { vendorId: v.id, index: String(allPhotos.indexOf(cover)) },
          })
        }
        style={[styles.hero, { height: heroHeight }]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, heroStyle]}>
          <Image
            source={{ uri: cover.url.medium }}
            placeholder={cover.blurhash ? { blurhash: cover.blurhash } : undefined}
            contentFit="cover"
            transition={250}
            accessible={false}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {allPhotos.length > 1 && (
          <Glass style={styles.photoCount}>
            <Icon name="image-outline" size={16} color={Colors.text} />
            <AppText variant="caption" weight={600} style={styles.tabular}>
              {String(allPhotos.length)}
            </AppText>
          </Glass>
        )}
      </Pressable>
    ) : (
      <View style={[styles.hero, styles.heroEmpty, { height: heroBand }]}>
        <Icon
          name={groupIcon(v.categories[0]?.groupSlug ?? '')}
          size={Sizes.iconLarge + 16}
          color={Colors.primary}
        />
      </View>
    );

    body = (
      <>
        {/* The web page people land on from a QR code or a shared link. */}
        <Head>
          <title>{category ? t('vendor.pageTitle', { name, category, city: v.city }) : name}</title>
          {tagline ? <meta name="description" content={tagline} /> : null}
        </Head>

        <View style={styles.titleBlock} onLayout={(layout) => onTitleLayout(layout, heroBand)}>
          {v.foundingNumber != null && (
            <View style={styles.founding}>
              <Icon name="ribbon-outline" size={17} color={Colors.kesari} weight="semibold" />
              <AppText variant="label" weight={600} color="kesari">
                {t('vendor.foundingNumber', { number: v.foundingNumber })}
              </AppText>
            </View>
          )}
          <AppText variant="title" lang={primary.lang} accessibilityRole="header">
            {primary.text}
          </AppText>
          {secondary && (
            <AppText variant="bodyLg" color="text2" lang={secondary.lang}>
              {secondary.text}
            </AppText>
          )}
          <AppText color="text2">{[categoryNames.join(', '), v.city].join(' · ')}</AppText>
        </View>

        {tagline && <AppText variant="bodyLg">{tagline}</AppText>}

        {Platform.OS === 'web' && (
          <Button
            variant="secondary"
            icon="phone-portrait-outline"
            label={t('vendor.openInApp')}
            onPress={() => void Linking.openURL(appLink(`/v/${v.slug}`))}
          />
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

        <ListSection inset>
          <ListRow
            icon="location-outline"
            title={v.addressLine ?? t('vendor.basedIn', { city: v.city })}
          />
          {!v.addressLine && (
            <ListRow
              icon="car-outline"
              title={
                (v.serviceRadiusMiles >= ALL_NORCAL_MILES
                  ? t('vendor.travelsNorcal')
                  : t('vendor.travelsUpTo', { miles: v.serviceRadiusMiles })) +
                (v.willTravel && v.travelNote ? ` ${v.travelNote}` : '')
              }
            />
          )}
          {languages.length > 0 && (
            <ListRow icon="language-outline" title={t('vendor.speaks', { languages })} />
          )}
        </ListSection>

        {v.price && (
          <View style={styles.block}>
            <SectionTitle>{t('vendor.price')}</SectionTitle>
            <Card style={styles.priceCard}>
              <AppText variant="section" style={styles.tabular}>
                {priceLine(v.price, t)}
              </AppText>
              {v.priceNote && <AppText>{v.priceNote}</AppText>}
              {(v.price.kind === 'starting_at' || v.price.kind === 'range') && (
                <AppText variant="label" weight={400} color="text2">
                  {t('vendor.priceCaption')}
                </AppText>
              )}
            </Card>
          </View>
        )}

        {facts.length > 0 && (
          <View style={styles.block}>
            <SectionTitle>{t('vendor.goodToKnow')}</SectionTitle>
            <View style={styles.pills}>
              {facts.map((fact) => (
                <View key={fact} style={styles.pill}>
                  <Icon name="checkmark-circle" size={17} color={Colors.success} />
                  <AppText variant="label">{fact}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}

        {allPhotos.length > 0 && (
          <View style={styles.block}>
            <SectionTitle>{t('vendor.photos')}</SectionTitle>
            <PhotoGrid vendorId={v.id} photos={allPhotos} />
          </View>
        )}

        {realWeddings.data && realWeddings.data.length > 0 && (
          <View style={styles.block}>
            <SectionTitle>{t('vendor.realWeddings')}</SectionTitle>
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
                    transition={200}
                    accessible={false}
                    style={styles.realWeddingPhoto}
                  />
                  <View style={styles.realWeddingCaption}>
                    <AppText weight={600} style={styles.grow}>
                      {t('vendor.photoBy', { name: by })}
                    </AppText>
                    <Icon
                      name="chevron-forward"
                      size={17}
                      color={Colors.chevron}
                      weight="semibold"
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
          <View style={styles.block}>
            <SectionTitle>{t('vendor.about')}</SectionTitle>
            <Card>
              <AppText variant="bodyLg">{bio}</AppText>
            </Card>
          </View>
        )}

        {contacts.length > 0 && (
          <View style={styles.block}>
            <SectionTitle>{t('vendor.contact')}</SectionTitle>
            <ListSection>
              {contacts.map((line) => (
                <View key={line.label} style={styles.contact}>
                  <AppText variant="label" weight={400} color="text2">
                    {line.label}
                  </AppText>
                  <AppText variant="bodyLg" selectable style={styles.tabular}>
                    {line.value}
                  </AppText>
                </View>
              ))}
            </ListSection>
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

  const barBottom = Math.max(insets.bottom - 8, Spacing.md);

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={scroll.onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: barHeight + barBottom + Spacing.xl }}
      >
        {hero}
        <View style={[styles.content, !hero && { paddingTop: navTop }]}>{body}</View>
      </Animated.ScrollView>

      <NavBar scroll={scroll} title={vendor.data ? localized(vendor.data.name, locale) : null} />

      {vendor.data && (
        <View
          style={[styles.barWrap, { bottom: barBottom }]}
          onLayout={(layout) => setBarHeight(layout.nativeEvent.layout.height)}
        >
          <Glass style={[styles.bar, stackButtons && styles.barStacked]}>
            <Button
              variant="secondary"
              icon={saved ? 'heart' : 'heart-outline'}
              label={saved ? t('vendor.saved') : t('vendor.save')}
              accessibilityLabel={t(saved ? 'vendorCard.unsave' : 'vendorCard.save', {
                name: localized(vendor.data.name, locale),
              })}
              onPress={() => {
                if (!vendor.data) return;
                if (!saved) saveHaptic();
                toggleSave(vendor.data.id, event);
              }}
              style={[styles.barButton, !stackButtons && styles.save]}
            />
            <Button
              label={t('vendor.ask')}
              onPress={() =>
                vendor.data &&
                router.push({
                  pathname: '/ask',
                  params: event
                    ? { vendorId: vendor.data.id, event }
                    : { vendorId: vendor.data.id },
                })
              }
              style={[styles.barButton, !stackButtons && styles.ask]}
            />
          </Glass>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: Colors.skeleton,
  },
  heroEmpty: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.primaryTint,
  },
  photoCount: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.chip,
  },
  content: {
    gap: Spacing.xl,
    paddingHorizontal: Sizes.pageGutter,
    paddingTop: Spacing.xl,
  },
  titleBlock: {
    gap: Spacing.xs,
  },
  founding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  block: {
    gap: Spacing.lg,
  },
  priceCard: {
    gap: Spacing.xs,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
  },
  grid: {
    gap: 3,
    borderRadius: Radius.photo,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 3,
  },
  gridPhoto: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.skeleton,
  },
  gridGap: {
    flex: 1,
    aspectRatio: 1,
  },
  gridImage: {
    flex: 1,
  },
  dimmed: {
    opacity: 0.7,
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
  grow: {
    flex: 1,
  },
  contact: {
    gap: 2,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  barWrap: {
    position: 'absolute',
    left: Sizes.tabBarInset,
    right: Sizes.tabBarInset,
  },
  bar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: (Sizes.button + Spacing.sm * 2) / 2,
  },
  barStacked: {
    flexDirection: 'column',
    borderRadius: Radius.card + Spacing.sm,
  },
  barButton: {
    paddingHorizontal: Spacing.md,
  },
  // Save 40 percent, Ask 60 percent (vision doc S9).
  save: {
    flex: 2,
  },
  ask: {
    flex: 3,
  },
});
