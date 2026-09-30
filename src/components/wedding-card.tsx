import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { makeStyles, Radius, Spacing, useColors } from '@/constants/theme';
import { formatDate } from '@/features/inquiry/inquiry-helpers';
import { bookedCount, daysUntil, usePlan } from '@/features/planner/plan';
import { useLocale } from '@/i18n/locale-context';

/**
 * The wedding countdown, like a home-screen widget: "256 days to go" with
 * the date and how much is booked; or, before a date is set, a nudge to plan.
 * Opens My Wedding.
 */
export function WeddingCard() {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const plan = usePlan();
  const days = plan.weddingDate ? daysUntil(plan.weddingDate) : null;
  const booked = bookedCount(plan);
  const counting = days !== null && days >= 0 && plan.weddingDate;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push('/plan')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Icon name="calendar-outline" size={24} color={Colors.primary} />
      </View>
      <View style={styles.text}>
        {counting ? (
          <>
            <AppText variant="heading" weight={700}>
              {t('planner.daysToGo', { count: days })}
            </AppText>
            <AppText variant="label" weight={400} color="text2">
              {[
                formatDate(plan.weddingDate as string),
                plan.events.length > 0 ? t('planner.bookedShort', { count: booked }) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </AppText>
          </>
        ) : (
          <>
            <AppText variant="heading" weight={700}>
              {t('planner.cardTitle')}
            </AppText>
            <AppText variant="label" weight={400} color="text2">
              {t('planner.cardBody')}
            </AppText>
          </>
        )}
      </View>
      <Icon name="chevron-forward" size={17} color={Colors.chevron} weight="semibold" />
    </Pressable>
  );
}

const useStyles = makeStyles((Colors) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryTint,
  },
  text: {
    flex: 1,
    gap: 2,
  },
}));
