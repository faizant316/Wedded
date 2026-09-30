import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles, Radius, Spacing } from '@/constants/theme';
import type { DietTag } from '@/features/menus/menu-types';
import { useLocale } from '@/i18n/locale-context';

/** Read-only pills for a menu's diet tags ("Veg", "Jhatka", "Halal"), words not colours. */
export function DietChips({ tags, small = false }: { tags: DietTag[]; small?: boolean }) {
  const styles = useStyles();
  const { t } = useLocale();
  if (tags.length === 0) return null;
  return (
    <View style={styles.row}>
      {tags.map((tag) => (
        <View
          key={tag}
          style={[styles.chip, tag === 'veg' || tag === 'vegan' ? styles.green : null]}
        >
          <AppText variant={small ? 'caption' : 'label'} weight={600}>
            {t(`menus.diet.${tag}`)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: Radius.chip,
    backgroundColor: Colors.fill,
  },
  // Veg is also marked in words; the tint only helps people who scan for it.
  green: {
    backgroundColor: Colors.successTint,
  },
}));
