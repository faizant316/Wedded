import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/state-view';
import { Spacing } from '@/constants/theme';
import { useAreaCodes } from '@/data/places';
import { setAnswers, useAnswers } from '@/features/onboarding/answers';
import { useFinishOnboarding } from '@/features/onboarding/finish';
import { OnboardingStep } from '@/features/onboarding/onboarding-step';
import { OptionCard } from '@/features/onboarding/option-card';
import { nextHref } from '@/features/onboarding/steps';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { successHaptic } from '@/lib/haptics';

/**
 * The last question: roughly where the wedding is, as the area-code chips
 * people already use ("530 · Yuba City"), so vendors show nearest first. No
 * location permission needed. Then the answers become their plan.
 */
export default function PlaceStep() {
  const { t, locale } = useLocale();
  const answers = useAnswers();
  const areas = useAreaCodes();
  const finish = useFinishOnboarding();

  function done() {
    successHaptic();
    finish();
    router.push(nextHref('place'));
  }

  return (
    <OnboardingStep
      step="place"
      title={t('onboarding.place.title')}
      subtitle={t('onboarding.place.subtitle')}
      continueLabel={t('onboarding.place.finish')}
      onContinue={done}
      onSkip={() => {
        setAnswers({ areaCode: null });
        done();
      }}
    >
      {areas.isPending && <StateView state="loading" />}
      {areas.isError && <StateView state="error" onRetry={() => void areas.refetch()} />}
      <View style={styles.list} accessibilityRole="radiogroup">
        {areas.data?.map((area, index) => (
          <OptionCard
            key={area.code}
            index={index}
            icon="location-outline"
            label={localized(area.label, locale)}
            detail={area.code}
            selected={answers.areaCode === area.code}
            onPress={() =>
              setAnswers({ areaCode: answers.areaCode === area.code ? null : area.code })
            }
          />
        ))}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
});
