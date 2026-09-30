import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useBackgrounds } from '@/data/reference';
import { setAnswers, toggleIn, useAnswers } from '@/features/onboarding/answers';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { OptionCard } from '@/features/onboarding/option-card';
import { nextHref } from '@/features/onboarding/steps';
import { bilingual } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * Question 3: where the family is from (several for a mixed wedding). Only
 * used to suggest traditions and events; never saved.
 */
export default function BackgroundStep() {
  const { t, locale } = useLocale();
  const answers = useAnswers();
  const backgrounds = useBackgrounds();
  const next = () => router.push(nextHref('background'));

  return (
    <OnboardingStep
      step="background"
      title={t('onboarding.background.title')}
      subtitle={t('onboarding.background.subtitle')}
      onContinue={next}
      onSkip={() => {
        setAnswers({ backgrounds: [] });
        next();
      }}
    >
      {backgrounds.isPending && <StateView state="loading" />}
      {backgrounds.isError && (
        <StateView state="error" onRetry={() => void backgrounds.refetch()} />
      )}
      <View style={styles.list}>
        {backgrounds.data?.map((background, index) => {
          const { primary, secondary } = bilingual(background.name, locale);
          return (
            <OptionCard
              key={background.slug}
              index={index}
              role="checkbox"
              label={primary.text}
              labelLang={primary.lang}
              detail={secondary?.text}
              detailLang={secondary?.lang}
              selected={answers.backgrounds.includes(background.slug)}
              onPress={() =>
                setAnswers({ backgrounds: toggleIn(answers.backgrounds, background.slug) })
              }
            />
          );
        })}
        {backgrounds.data && (
          <OptionCard
            index={backgrounds.data.length}
            label={t('onboarding.preferNot')}
            selected={false}
            onPress={() => {
              setAnswers({ backgrounds: [] });
              next();
            }}
          />
        )}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
});
