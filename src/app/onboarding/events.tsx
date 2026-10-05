import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useFontScale } from '@/components/app-text';
import { Button } from '@/components/button';
import { SectionTitle } from '@/components/list';
import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useTraditions, type TraditionEvent } from '@/data/reference';
import { setAnswers, toggleIn, useAnswers } from '@/features/onboarding/answers';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { nextHref } from '@/features/onboarding/steps';
import { EventChoice } from '@/features/planner/event-choice';
import { mergedEvents, traditionsFor } from '@/features/planner/plan';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { Motion } from '@/lib/motion';

/**
 * Question 4: which events they're having. The traditions from the two
 * answers before choose the list, with their main events already ticked
 * (a Pakistani Muslim family sees Mangni, Dholki, Mayun, Mehndi, Nikah,
 * Shadi and Walima); the rest wait under "More events".
 */
export default function EventsStep() {
  const { t, locale } = useLocale();
  const answers = useAnswers();
  const traditions = useTraditions();
  const wide = useFontScale('body') > 1.3;

  const picked = useMemo(
    () => traditionsFor(answers.backgrounds, answers.faiths, traditions.data ?? []),
    [answers.backgrounds, answers.faiths, traditions.data],
  );
  const events = useMemo(() => mergedEvents(picked), [picked]);
  const main = useMemo(() => events.filter((event) => event.isCore), [events]);
  const more = events.filter((event) => !event.isCore);
  const chosen = answers.events ?? [];
  const [showMore, setShowMore] = useState(false);

  // The first time the list is ready, tick the main events for them.
  useEffect(() => {
    if (answers.events === null && main.length > 0) {
      const ticked = main.map((event) => event.slug);
      // Events they named in a search are ticked too
      const named = answers.extraEvents.filter(
        (slug) => !ticked.includes(slug) && events.some((event) => event.slug === slug),
      );
      setAnswers({ events: [...ticked, ...named] });
    }
  }, [answers.events, answers.extraEvents, events, main]);

  const grid = (list: TraditionEvent[]) => (
    <View style={styles.grid}>
      {list.map((event) => (
        <EventChoice
          key={event.slug}
          event={event}
          wide={wide}
          selected={chosen.includes(event.slug)}
          onPress={() => setAnswers({ events: toggleIn(chosen, event.slug) })}
        />
      ))}
    </View>
  );

  const names = picked.map((tradition) => localized(tradition.name, locale)).join(' · ');
  const next = () => router.push(nextHref('events'));

  return (
    <OnboardingStep
      step="events"
      title={t('onboarding.events.title')}
      subtitle={names ? t('onboarding.events.subtitle', { traditions: names }) : undefined}
      canContinue={chosen.length > 0}
      onContinue={next}
      onSkip={next}
    >
      {traditions.isPending && <StateView state="loading" />}
      {traditions.isError && <StateView state="error" onRetry={() => void traditions.refetch()} />}
      {grid(main)}
      {more.length > 0 && (
        <Animated.View layout={Motion.layout} style={styles.block}>
          {showMore && (
            <>
              <SectionTitle>{t('planner.picker.more')}</SectionTitle>
              {grid(more)}
            </>
          )}
          <Button
            variant="secondary"
            icon={showMore ? 'chevron-up' : 'chevron-down'}
            label={
              showMore
                ? t('planner.showLess')
                : t('planner.picker.showMore', { count: more.length })
            }
            onPress={() => setShowMore((shown) => !shown)}
          />
        </Animated.View>
      )}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  block: {
    gap: Spacing.md,
  },
});
