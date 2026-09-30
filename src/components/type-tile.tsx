import { View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { gradient, makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { localized, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * A compact tile for one kind of vendor on Home ("Venues", "Food"): a
 * white icon on a maroon disc and the name in the app's language, nothing
 * else. Made for a two-column grid; give each tile `flex: 1`.
 */
export function TypeTile({
  name,
  icon,
  onPress,
  style,
}: {
  name: LocalizedText;
  icon: IconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const Colors = useColors();
  const styles = useStyles();
  const { locale } = useLocale();
  const label = localized(name, locale);
  const scale = Math.min(useFontScale('body'), 1.4);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tile, style]}
    >
      <View style={[styles.disc, { width: 36 * scale, height: 36 * scale }]}>
        <Icon name={icon} size={Sizes.iconSmall * scale} color={Colors.onPrimary} />
      </View>
      <AppText weight={600} style={styles.label}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const useStyles = makeStyles((Colors) => ({
  tile: {
    minHeight: Sizes.tapTarget + Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.photo,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  label: {
    flex: 1,
  },
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Colors.primaryFill,
    ...gradient(Colors.glyphFill),
  },
}));
