import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { eventIcon } from '@/components/event-icon';
import { Icon } from '@/components/icon';
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { useTraditions, type TraditionEvent } from '@/data/reference';
import { useSession } from '@/features/auth/session';
import { SignInOptions } from '@/features/auth/sign-in-options';
import { markOnboarding } from '@/features/onboarding/onboarding-state';
import { mergedEvents } from '@/features/planner/plan';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { selectionHaptic } from '@/lib/haptics';
import { Motion } from '@/lib/motion';

/**
 * The first screen a new person sees, like ChatGPT's or Claude's: the app's
 * name, one line on what it's for, events from every tradition drifting
 * past, and "Continue with" Apple, Google, phone or email. "Just look around
 * first" skips signing in (App Store rule 5.1.1: browsing needs no account).
 * Once they're signed in, Home decides what's next (the first questions for a
 * family, straight in for a vendor).
 */
export default function WelcomeScreen() {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const { status } = useSession();

  // Back here signed in (Apple or Google finish on this screen; phone and
  // email finish in the sign-in sheet): About you if it's still missing,
  // otherwise on to the app.
  useFocusEffect(
    useCallback(() => {
      if (status === 'signedIn') router.replace('/');
      else if (status === 'needsProfile') router.push('/sign-in');
    }, [status]),
  );

  function browse() {
    selectionHaptic();
    markOnboarding('seen');
    router.replace('/');
  }

  return (
    <Screen edges={['top', 'bottom']} plain>
      <View style={styles.top}>
        <LanguageToggle />
      </View>

      <View style={styles.hero}>
        <Animated.View entering={Motion.popIn} style={styles.mark}>
          <Icon name="sparkles" size={30} color={Colors.onPrimary} />
        </Animated.View>
        <Animated.View entering={Motion.rise} style={styles.words}>
          <AppText variant="label" weight={700} color="primary" style={styles.brand}>
            {t('app.name')}
          </AppText>
          <AppText variant="display" weight={800} style={styles.headline}>
            {t('welcome.title')}
          </AppText>
          <AppText variant="bodyLg" color="text2">
            {t('welcome.subtitle')}
          </AppText>
        </Animated.View>
        <EventDrift />
      </View>

      <Animated.View entering={Motion.stagger(3)} style={styles.actions}>
        <SignInOptions />
        <Pressable
          accessibilityRole="button"
          onPress={browse}
          hitSlop={8}
          style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
        >
          <AppText weight={600} color="primary">
            {t('welcome.browse')}
          </AppText>
        </Pressable>
        <AppText variant="caption" color="text2" style={styles.terms}>
          {t('welcome.terms')}
        </AppText>
      </Animated.View>
    </Screen>
  );
}

/**
 * Two rows of event names from every tradition (Roka, Nikah, Jaago,
 * Walima...) drifting slowly in opposite directions: the app is for every
 * family. Decoration only, so screen readers skip it; still with Reduce Motion.
 */
function EventDrift() {
  const styles = useStyles();
  const traditions = useTraditions();
  const events = useMemo(
    () => mergedEvents(traditions.data ?? []).filter((event) => event.isCore),
    [traditions.data],
  );
  if (events.length === 0) return <View style={styles.drift} />;
  const half = Math.ceil(events.length / 2);

  return (
    <View
      style={styles.drift}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <DriftRow events={events.slice(0, half)} duration={38000} />
      <DriftRow events={events.slice(half)} duration={44000} reverse />
    </View>
  );
}

function DriftRow({
  events,
  duration,
  reverse = false,
}: {
  events: TraditionEvent[];
  duration: number;
  reverse?: boolean;
}) {
  const Colors = useColors();
  const styles = useStyles();
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const shift = useSharedValue(0);

  useEffect(() => {
    if (width === 0 || reduceMotion) return;
    shift.value = 0;
    shift.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(shift);
  }, [duration, reduceMotion, shift, width]);

  // The pills are drawn twice side by side, so sliding one copy's width loops seamlessly.
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: reverse ? (shift.value - 1) * width : -shift.value * width }],
  }));

  const pills = events.map((event, index) => (
    <View key={event.slug} style={[styles.pill, index % 3 === 1 && styles.pillTint]}>
      <Icon name={eventIcon(event.slug)} size={16} color={Colors.primary} />
      <AppText variant="label" weight={600} numberOfLines={1}>
        {localized(event.name, locale)}
      </AppText>
    </View>
  ));

  return (
    <View style={styles.rowClip}>
      <Animated.View style={[styles.row, slide]}>
        <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {pills}
        </View>
        <View style={styles.row}>{pills}</View>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  top: {
    minHeight: Sizes.navBar,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFill,
  },
  words: {
    gap: Spacing.sm,
  },
  brand: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.6,
  },
  drift: {
    gap: Spacing.sm,
    marginHorizontal: -Sizes.pageGutter,
    minHeight: 88,
  },
  rowClip: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  pill: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    backgroundColor: Colors.canvasCard,
  },
  pillTint: {
    backgroundColor: Colors.primaryTint,
  },
  actions: {
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  browse: {
    minHeight: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  terms: {
    textAlign: 'center',
  },
}));
