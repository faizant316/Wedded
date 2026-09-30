import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Glass } from '@/components/glass';
import { Colors, Sizes, Springs } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';
import type { Locale } from '@/i18n';
import { selectionHaptic } from '@/lib/haptics';

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'EN' },
  { locale: 'pa', label: 'ਪੰ' },
];

const WIDTH = 52;
const PAD = 3;

/**
 * The EN | ਪੰ switch in the Home bar, an iOS segmented control on glass: the
 * fastest way for a mixed household to flip the phone between parent and
 * child. The selected half slides over with a spring.
 */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();
  const reduceMotion = useReducedMotion();
  const index = OPTIONS.findIndex((option) => option.locale === locale);
  const x = useSharedValue(index * WIDTH);

  useEffect(() => {
    x.value = reduceMotion ? index * WIDTH : withSpring(index * WIDTH, Springs.snappy);
  }, [index, reduceMotion, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Glass interactive style={styles.track}>
      <View style={styles.row} accessibilityRole="radiogroup">
        <Animated.View style={[styles.thumb, thumb]} />
        {OPTIONS.map((option) => {
          const selected = option.locale === locale;
          return (
            <Pressable
              key={option.locale}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.locale === 'en' ? 'English' : 'ਪੰਜਾਬੀ'}
              onPress={() => {
                if (!selected) selectionHaptic();
                setLocale(option.locale);
              }}
              style={styles.option}
            >
              <AppText
                variant="label"
                lang={option.locale}
                color={selected ? 'onPrimary' : 'text'}
                weight={700}
                maxFontSizeMultiplier={1.2}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  track: {
    height: Sizes.tapTarget,
    borderRadius: Sizes.tapTarget / 2,
    padding: PAD,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  thumb: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: WIDTH,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  option: {
    width: WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
