import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type TextInput } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { FieldError } from '@/components/field-error';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { findZip, matchCities, useAreaCodes, useCities, type City } from '@/data/places';
import { hasLocationPermission, locateNearestCity } from '@/features/location/current-location';
import { DISTANCE_CHOICES, useSearchLocation } from '@/features/location/search-location';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * "Where should we look?" (vision S22a), a modal: type a city or ZIP (with
 * suggestions from our NorCal list), or pick an area-code chip, then how far.
 * Saved on this phone. "Use my current location" explains itself before the
 * phone's permission prompt (S22b) and uses the nearest city, never the exact
 * position.
 */
export default function LocationScreen() {
  const { t, locale } = useLocale();
  const { place, maxMiles, setPlace, setMaxMiles, clearPlace } = useSearchLocation();
  const cities = useCities();
  const areaCodes = useAreaCodes();
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string>();
  const [checkingZip, setCheckingZip] = useState(false);
  const [explainGps, setExplainGps] = useState(false);
  const [locating, setLocating] = useState(false);
  const cityInput = useRef<TextInput>(null);

  const typed = text.trim();
  const zip = /^\d{5}$/.test(typed) ? typed : null;
  const suggestions = !zip && cities.data ? matchCities(cities.data, typed) : [];

  function close() {
    if (router.canGoBack()) router.back();
  }

  /** S22b: explain first, then the phone's own prompt; never at launch. */
  async function useCurrentLocation() {
    setMessage(undefined);
    if (await hasLocationPermission()) {
      await locate();
    } else {
      setExplainGps(true);
    }
  }

  async function locate() {
    setExplainGps(false);
    if (!cities.data) return;
    setLocating(true);
    const result = await locateNearestCity(cities.data);
    setLocating(false);
    if (result.kind === 'found') {
      chooseCity(result.city);
    } else {
      setMessage(t(`location.gps.${result.kind}`));
      if (result.kind === 'denied' || result.kind === 'unavailable') cityInput.current?.focus();
    }
  }

  function chooseCity(city: City) {
    setPlace({ label: city.name, latitude: city.latitude, longitude: city.longitude });
    setText('');
    setMessage(undefined);
  }

  async function chooseZip(code: string) {
    setCheckingZip(true);
    setMessage(undefined);
    try {
      const found = await findZip(code);
      if (found) {
        setPlace(found);
        setText('');
      } else {
        setMessage(t('location.zipOutside'));
      }
    } catch {
      setMessage(t('states.error'));
    } finally {
      setCheckingZip(false);
    }
  }

  function submitTyped() {
    if (zip) void chooseZip(zip);
    else if (suggestions[0]) chooseCity(suggestions[0]);
    else if (typed) setMessage(t('location.noMatch'));
  }

  const customMiles = maxMiles !== null && !DISTANCE_CHOICES.includes(maxMiles) ? maxMiles : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('signIn.close')}
          onPress={close}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Ionicons name="close" size={Sizes.icon + 4} color={Colors.text} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title" accessibilityRole="header">
          {t('location.title')}
        </AppText>
        <AppText color="text2">{t('location.subtitle')}</AppText>

        <Button
          variant="secondary"
          icon="navigate-outline"
          label={t('location.gps.use')}
          loading={locating}
          onPress={useCurrentLocation}
        />
        {explainGps && (
          <Card style={styles.explain}>
            <AppText variant="heading">{t('location.gps.explainTitle')}</AppText>
            <AppText>{t('location.gps.explainBody')}</AppText>
            <Button label={t('location.gps.allow')} onPress={locate} />
            <Button
              variant="text"
              label={t('location.gps.typeInstead')}
              onPress={() => {
                setExplainGps(false);
                cityInput.current?.focus();
              }}
            />
          </Card>
        )}

        {place && (
          <Card style={styles.current}>
            <Ionicons name="location" size={Sizes.icon} color={Colors.primary} />
            <AppText weight={700} style={styles.grow}>
              {t('location.current', { place: place.label })}
            </AppText>
            <Button variant="text" label={t('location.clear')} onPress={clearPlace} />
          </Card>
        )}

        <TextField
          ref={cityInput}
          label={t('location.cityOrZip')}
          hint={t('location.cityOrZipHint')}
          value={text}
          onChangeText={(value) => {
            setText(value);
            setMessage(undefined);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={submitTyped}
        />
        {message && <FieldError message={message} />}

        {zip && (
          <Button
            label={t('location.useZip', { zip })}
            icon="navigate-outline"
            loading={checkingZip}
            onPress={() => chooseZip(zip)}
          />
        )}
        {suggestions.length > 0 && (
          <View style={styles.suggestions} accessibilityRole="list">
            {suggestions.map((city) => (
              <Pressable
                key={city.slug}
                accessibilityRole="button"
                onPress={() => chooseCity(city)}
                style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
              >
                <Ionicons name="location-outline" size={Sizes.iconSmall} color={Colors.text2} />
                <AppText variant="bodyLg" style={styles.grow}>
                  {city.name}
                </AppText>
                <AppText color="text2">{city.areaCode}</AppText>
              </Pressable>
            ))}
          </View>
        )}
        {typed.length > 1 && !zip && cities.data && suggestions.length === 0 && (
          <AppText color="text2">{t('location.noMatch')}</AppText>
        )}

        <AppText variant="heading" accessibilityRole="header">
          {t('location.areas')}
        </AppText>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {(areaCodes.data ?? []).map((area) => {
            const label = `${area.code} · ${localized(area.label, locale)}`;
            return (
              <Chip
                key={area.code}
                role="radio"
                label={label}
                selected={place?.label === label}
                onPress={() => {
                  setPlace(
                    { label, latitude: area.latitude, longitude: area.longitude },
                    area.radiusMiles,
                  );
                  setMessage(undefined);
                }}
              />
            );
          })}
        </View>

        <AppText variant="heading" accessibilityRole="header">
          {t('location.distance')}
        </AppText>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {DISTANCE_CHOICES.map((miles) => (
            <Chip
              key={miles ?? 'anywhere'}
              role="radio"
              label={
                miles === null ? t('location.anywhere') : t('location.miles', { count: miles })
              }
              selected={maxMiles === miles}
              onPress={() => setMaxMiles(miles)}
            />
          ))}
          {customMiles !== null && (
            <Chip
              role="radio"
              label={t('location.miles', { count: customMiles })}
              selected
              onPress={() => setMaxMiles(customMiles)}
            />
          )}
        </View>

        <Button label={t('location.done')} onPress={close} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Spacing.sm,
  },
  close: {
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.tapTarget / 2,
  },
  pressed: {
    backgroundColor: Colors.primaryTint,
  },
  content: {
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  explain: {
    gap: Spacing.md,
  },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  grow: {
    flex: 1,
  },
  suggestions: {
    borderRadius: Radius.card,
    borderWidth: BorderWidth.hairline,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  suggestion: {
    minHeight: Sizes.tapTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: BorderWidth.hairline,
    borderBottomColor: Colors.border,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
