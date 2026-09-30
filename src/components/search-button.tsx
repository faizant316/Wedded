import { Pressable } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

/**
 * Looks like the iOS search field, acts as a button: tapping it opens the
 * Search tab (vision doc S4). The real text field lives on the Search screen.
 */
export function SearchButton({ onPress }: { onPress: () => void }) {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const scale = useFontScale('body');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('search.placeholder')}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}
    >
      <Icon name="search" size={Sizes.iconSmall * scale} color={Colors.text2} weight="medium" />
      <AppText color="text2" style={styles.label}>
        {t('search.placeholder')}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles((Colors) => ({
  field: {
    minHeight: Sizes.search,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.button,
    backgroundColor: Colors.fill,
  },
  pressed: {
    backgroundColor: Colors.fillPressed,
  },
  label: {
    flex: 1,
  },
}));
