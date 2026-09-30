import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useFaiths } from '@/data/reference';
import { setAnswers, toggleIn, useAnswers } from '@/features/onboarding/answers';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { OptionCard } from '@/features/onboarding/option-card';
import { nextHref } from '@/features/onboarding/steps';
import { bilingual } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * Question 4: faith, so we suggest the right ceremonies (a Nikah, an Anand
 * Karaj, Pheras). Optional, several allowed, and never saved.
 */
export default function FaithStep() {
  const { t, locale } = useLocale();
  const answers = useAnswers();
  const faiths = useFaiths();
  const next = () => router.push(nextHref('faith'));

  return (
    <OnboardingStep
      step="faith"
      title={t('onboarding.faith.title')}
      subtitle={t('onboarding.faith.subtitle')}
      onContinue={next}
      onSkip={() => {
        setAnswers({ faiths: [] });
        next();
      }}
    >
      {faiths.isPending && <StateView state="loading" />}
      {faiths.isError && <StateView state="error" onRetry={() => void faiths.refetch()} />}
      <View style={styles.list}>
        {faiths.data?.map((faith, index) => {
          const { primary, secondary } = bilingual(faith.name, locale);
          return (
            <OptionCard
              key={faith.slug}
              index={index}
              role="checkbox"
              label={primary.text}
              labelLang={primary.lang}
              detail={secondary?.text}
              detailLang={secondary?.lang}
              selected={answers.faiths.includes(faith.slug)}
              onPress={() => setAnswers({ faiths: toggleIn(answers.faiths, faith.slug) })}
            />
          );
        })}
        {faiths.data && (
          <OptionCard
            index={faiths.data.length}
            label={t('onboarding.preferNot')}
            selected={false}
            onPress={() => {
              setAnswers({ faiths: [] });
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
