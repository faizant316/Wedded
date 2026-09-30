import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

import { useSearchLocation } from './search-location';

/**
 * The full-width location chip for Home and results (vision S4 item 2):
 * "Near Yuba City · 25 mi ⌄" on a white capsule, or "Set your location to see
 * distance ⌄" tinted in the app colour when nothing is set. Opens the
 * location sheet.
 */
export function LocationChip({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useLocale();
  const { place, maxMiles, openLocationSheet } = useSearchLocation();
  const scale = useFontScale('body');

  let label: string;
  if (!place) label = t('location.chip.unset');
  else if (maxMiles === null) label = t('location.chip.anywhere', { place: place.label });
  else label = t('location.chip.near', { place: place.label, miles: maxMiles });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('location.chip.hint')}
      onPress={openLocationSheet}
      style={({ pressed }) => [
        styles.chip,
        !place && styles.unset,
        pressed && (place ? styles.pressed : styles.unsetPressed),
        style,
      ]}
    >
      <Icon
        name={place ? 'location' : 'location-outline'}
        size={Sizes.iconSmall * scale}
        color={Colors.primary}
      />
      <AppText weight={600} color={place ? 'text' : 'primary'} style={styles.label}>
        {label}
      </AppText>
      <Icon name="chevron-down" size={15 * scale} color={Colors.chevron} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: Sizes.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.chip,
    backgroundColor: Colors.surface,
  },
  unset: {
    backgroundColor: Colors.primaryTint,
  },
  pressed: {
    backgroundColor: Colors.rowPressed,
  },
  unsetPressed: {
    backgroundColor: Colors.fillPressed,
  },
  label: {
    flex: 1,
  },
});
