import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { BorderWidth, Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

import { useSearchLocation } from './search-location';

/**
 * The full-width location chip for Home and results (vision S4 item 2):
 * "Near Yuba City · 25 mi ▾", or "Set your location to see distance ▾" with a
 * marigold border when nothing is set. Opens the location sheet.
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
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name="location-outline" size={Sizes.iconSmall * scale} color={Colors.primary} />
      <AppText weight={700} style={styles.label}>
        {label}
      </AppText>
      <Ionicons name="chevron-down" size={Sizes.iconSmall * scale} color={Colors.text2} />
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
    borderWidth: BorderWidth.strong,
    borderColor: Colors.borderInput,
    backgroundColor: Colors.surface,
  },
  unset: {
    borderColor: Colors.accent,
  },
  pressed: {
    backgroundColor: Colors.primaryTint,
  },
  label: {
    flex: 1,
  },
});
