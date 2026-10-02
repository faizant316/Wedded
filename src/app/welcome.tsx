import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { LanguageToggle } from '@/components/language-toggle';
import { Screen } from '@/components/screen';
import { makeStyles, Sizes, Spacing, useColors, useTextScale } from '@/constants/theme';
import { useTraditions, type TraditionEvent } from '@/data/reference';
import { useSession } from '@/features/auth/session';
import { SignInOptions } from '@/features/auth/sign-in-options';
import { markOnboarding } from '@/features/onboarding/onboarding-state';
import { mergedEvents } from '@/features/planner/plan';
import { SilkHero } from '@/features/welcome/silk-hero';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { selectionHaptic } from '@/lib/haptics';
import { Motion } from '@/lib/motion';
import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_600SemiBold_Italic,
  PlayfairDisplay_400Regular_Italic,
  useFonts,
} from '@expo-google-fonts/playfair-display';

/**
 * The first screen a new person sees, like ChatGPT's or Claude's: the ribbon
 * knot on a sheet of live satin you can touch (SilkHero), the app's name and
 * one line on what it's for in an editorial serif, events from every
 * tradition drifting past, and "Continue with" Apple, Google, phone or email. "Just look around
 * first" skips signing in (App Store rule 5.1.1: browsing needs no account).
 * Once they're signed in, Home decides what's next (the first questions for a
 * family, straight in for a vendor).
 */
export default function WelcomeScreen() {
  const styles = useStyles();
  const { t } = useLocale();
  const { status } = useSession();
  const insets = useSafeAreaInsets();

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
    <Screen edges={['bottom']} plain>
      <View style={styles.hero}>
        <SilkHero>
          <View style={[styles.top, { paddingTop: insets.top }]} pointerEvents="box-none">
            <LanguageToggle />
          </View>
        </SilkHero>
      </View>

      <Animated.View entering={Motion.rise} style={styles.words}>
        <AppText variant="label" weight={700} color="primary" style={styles.brand}>
          {t('app.name')}
        </AppText>
        <Headline text={t('welcome.title')} />
        <AppText variant="bodyLg" color="text2">
          {t('welcome.subtitle')}
        </AppText>
      </Animated.View>

      <EventDrift />

      <Animated.View entering={Motion.stagger(2)} style={styles.actions}>
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
 * "Plan your family's wedding, together." In English it's set in Playfair
 * Display, a high-contrast serif like the logo's wordmark, with the last word
 * in maroon italic; Gurmukhi keeps the app's own font.
 */
function Headline({ text }: { text: string }) {
  const Colors = useColors();
  const styles = useStyles();
  const { locale } = useLocale();
  const textScale = useTextScale();
  const [loaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_600SemiBold_Italic,
    PlayfairDisplay_400Regular_Italic,
  });

  if (locale === 'pa' || !loaded) {
    return (
      <AppText variant="display" weight={800} style={styles.headline} accessibilityRole="header">
        {text}
      </AppText>
    );
  }
  const split = text.lastIndexOf(' ');
  const lead = split > 0 ? text.slice(0, split + 1) : '';
  const last = split > 0 ? text.slice(split + 1) : text;
  return (
    <AppText
      variant="display"
      accessibilityRole="header"
      style={[styles.serif, { fontSize: 40 * textScale, lineHeight: 46 * textScale }]}
    >
      {lead}
      <Text style={[styles.serifAccent, { color: Colors.primary }]}>{last}</Text>
    </AppText>
  );
}

/**
 * Event names from every tradition (Roka, Nikah, Jaago, Walima...) drifting
 * slowly past in italic, like a line of a wedding card: the app is for every
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

  return (
    <View
      style={styles.drift}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <DriftRow events={events} duration={60000} />
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

  const [serif] = useFonts({ PlayfairDisplay_400Regular_Italic });
  const pills = events.map((event) => (
    <View key={event.slug} style={styles.name}>
      <AppText
        variant="bodyLg"
        color="text2"
        numberOfLines={1}
        style={locale === 'en' && serif ? styles.nameSerif : undefined}
      >
        {localized(event.name, locale)}
      </AppText>
      <Text style={[styles.dot, { color: Colors.primary }]}>✦</Text>
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

const useStyles = makeStyles(() => ({
  hero: {
    flex: 1,
    minHeight: 200,
    maxHeight: 420,
    marginHorizontal: -Sizes.pageGutter,
    marginBottom: Spacing.md,
  },
  top: {
    minHeight: Sizes.navBar,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: Sizes.pageGutter,
  },
  words: {
    gap: Spacing.sm,
  },
  brand: {
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.6,
  },
  serif: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontWeight: 'normal',
    letterSpacing: -0.4,
  },
  serifAccent: {
    fontFamily: 'PlayfairDisplay_600SemiBold_Italic',
    fontWeight: 'normal',
  },
  drift: {
    marginHorizontal: -Sizes.pageGutter,
    marginVertical: Spacing.lg,
    minHeight: 28,
  },
  rowClip: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  name: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameSerif: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontWeight: 'normal',
  },
  dot: {
    fontSize: 10,
    marginHorizontal: Spacing.md,
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
