import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { GlassButton } from '@/components/glass-button';
import { ProgressBar } from '@/components/progress-bar';
import { Screen } from '@/components/screen';
import { makeStyles, Sizes, Spacing, useColors } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';
import { selectionHaptic } from '@/lib/haptics';
import { Motion } from '@/lib/motion';

import { resetAnswers } from './answers';
import { markOnboarding } from './onboarding-state';
import { STEPS, stepNumber, type Step } from './steps';

export type OnboardingStepProps = {
  step: Step;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Continue is greyed out until this is true. */
  canContinue?: boolean;
  onContinue: () => void;
  continueLabel?: string;
  /** Shows Skip at the top right; skipping moves on without an answer. */
  onSkip?: () => void;
};

/**
 * One question of the first-launch setup, one per screen like Hinge or
 * Duolingo: a progress bar with Back (or Close on the first), a big question,
 * the choices, and Continue pinned at the bottom. The page is plain white.
 */
export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  canContinue = true,
  onContinue,
  continueLabel,
  onSkip,
}: OnboardingStepProps) {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const number = stepNumber(step);
  const first = number === 1;

  return (
    <Screen edges={['top', 'bottom']} plain>
      <View style={styles.bar}>
        <GlassButton
          icon={first ? 'close' : 'chevron-back'}
          color={Colors.text}
          size={44}
          accessibilityLabel={first ? t('onboarding.close') : t('common.back')}
          onPress={() => {
            if (!first && router.canGoBack()) {
              router.back();
              return;
            }
            // Closing the first question: not now. Home offers it again.
            markOnboarding('seen');
            resetAnswers();
            router.replace('/');
          }}
        />
        <View
          style={styles.progress}
          accessible
          accessibilityLabel={t('onboarding.stepOf', { step: number, total: STEPS.length })}
        >
          <ProgressBar
            value={number / STEPS.length}
            color={Colors.primaryFill}
            trackColor={Colors.fill}
            height={6}
          />
        </View>
        <View style={styles.side}>
          {onSkip && (
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => {
                selectionHaptic();
                onSkip();
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <AppText weight={600} color="text2">
                {t('onboarding.skip')}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={Motion.rise} style={styles.intro}>
          <AppText variant="label" weight={600} color="primary">
            {t('onboarding.stepOf', { step: number, total: STEPS.length })}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="bodyLg" color="text2">
              {subtitle}
            </AppText>
          )}
        </Animated.View>
        {children}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={continueLabel ?? t('onboarding.continue')}
          disabled={!canContinue}
          onPress={onContinue}
        />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((Colors) => ({
  bar: {
    minHeight: Sizes.navBar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progress: {
    flex: 1,
  },
  side: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.5,
  },
  content: {
    gap: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  intro: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
}));
