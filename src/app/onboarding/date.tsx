import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { Spacing } from '@/constants/theme';
import { setAnswers, useAnswers } from '@/features/onboarding/answers';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { OptionCard } from '@/features/onboarding/option-card';
import { nextHref } from '@/features/onboarding/steps';
import { useLocale } from '@/i18n/locale-context';

/** Question 2: the wedding day, for the countdown, or "not picked yet". */
export default function DateStep() {
  const { t } = useLocale();
  const answers = useAnswers();
  const next = () => router.push(nextHref('date'));

  return (
    <OnboardingStep
      step="date"
      title={t('onboarding.date.title')}
      subtitle={t('onboarding.date.subtitle')}
      canContinue={answers.weddingDate !== null || answers.noDateYet}
      onContinue={next}
      onSkip={next}
    >
      <View style={styles.list}>
        <DateField
          value={answers.weddingDate}
          onChange={(date) => setAnswers({ weddingDate: date, noDateYet: false })}
          placeholder={t('planner.pickDate')}
        />
        <OptionCard
          index={1}
          role="checkbox"
          icon="time-outline"
          label={t('onboarding.date.notYet')}
          detail={t('onboarding.date.notYetDetail')}
          selected={answers.noDateYet}
          onPress={() => setAnswers({ noDateYet: !answers.noDateYet, weddingDate: null })}
        />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.md,
  },
});
