import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { eventIcon } from '@/components/event-icon';
import { groupIcon } from '@/components/group-icon';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { resetAnswers } from '@/features/onboarding/answers';
import { CountdownCard } from '@/features/planner/countdown-card';
import { usePlanView } from '@/features/planner/use-plan-view';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { Motion } from '@/lib/motion';

/**
 * The end of the first questions, the payoff (like Calm's "recommended for
 * you"): their countdown, their events in order and the first things to
 * book, then into the app.
 */
export default function ReadyScreen() {
  const Colors = useColors();
  const styles = useStyles();
  const { t, locale } = useLocale();
  const { plan, chosen, progress, next } = usePlanView();

  return (
    <Screen edges={['top', 'bottom']} plain>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={Motion.popIn} style={styles.badge}>
          <Icon name="sparkles" size={34} color={Colors.onPrimary} />
        </Animated.View>
        <Animated.View entering={Motion.rise} style={styles.intro}>
          <AppText variant="title" accessibilityRole="header" style={styles.center}>
            {t('onboarding.ready.title')}
          </AppText>
          <AppText variant="bodyLg" color="text2" style={styles.center}>
            {t('onboarding.ready.subtitle')}
          </AppText>
        </Animated.View>

        <Animated.View entering={Motion.stagger(1)}>
          <CountdownCard plan={plan} progress={progress} eventsCount={chosen.length} />
        </Animated.View>

        {chosen.length > 0 && (
          <Animated.View entering={Motion.stagger(2)} style={styles.block}>
            <AppText variant="label" weight={600} color="text2" style={styles.pad}>
              {t('onboarding.ready.events')}
            </AppText>
            <View style={styles.events}>
              {chosen.map((event) => (
                <View key={event.slug} style={styles.event}>
                  <Icon name={eventIcon(event.slug)} size={16} color={Colors.primary} />
                  <AppText variant="label" weight={600}>
                    {localized(event.name, locale)}
                  </AppText>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {next.length > 0 && (
          <Animated.View entering={Motion.stagger(3)} style={styles.block}>
            <AppText variant="label" weight={600} color="text2" style={styles.pad}>
              {t('onboarding.ready.firstUp')}
            </AppText>
            <View style={styles.card}>
              {next.map(({ eventSlug, eventName, need }, index) => (
                <View
                  key={`${eventSlug}:${need.categorySlug}`}
                  style={[styles.row, index > 0 && styles.divided]}
                >
                  <Icon name={groupIcon(need.groupSlug)} size={20} color={Colors.primary} />
                  <View style={styles.grow}>
                    <AppText weight={500}>{localized(need.name, locale)}</AppText>
                    <AppText variant="caption" color="text2">
                      {localized(eventName, locale)}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t('onboarding.ready.go')}
          onPress={() => {
            resetAnswers();
            router.replace('/');
          }}
        />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((Colors) => ({
  content: {
    gap: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  badge: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFill,
  },
  intro: {
    gap: Spacing.sm,
  },
  center: {
    textAlign: 'center',
  },
  block: {
    gap: Spacing.sm,
  },
  pad: {
    paddingHorizontal: Spacing.xs,
  },
  events: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  event: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    backgroundColor: Colors.primaryTint,
  },
  card: {
    borderRadius: Radius.photo,
    borderCurve: 'continuous',
    backgroundColor: Colors.canvasCard,
    overflow: 'hidden',
  },
  row: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  divided: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  grow: {
    flex: 1,
  },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
}));
