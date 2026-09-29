import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppText, useFontScale } from '@/components/app-text';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

/**
 * "‹ Back" with a visible word, not just an arrow, for people who don't know
 * the gesture. With nothing to go back to (a cold deep link, or a web page
 * opened from a QR code or a shared link) it says Home and goes there.
 */
export function BackButton() {
  const router = useRouter();
  const { t } = useLocale();
  const scale = useFontScale('button');
  const canGoBack = router.canGoBack();
  const label = canGoBack ? t('common.back') : t('tabs.home');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => (canGoBack ? router.back() : router.navigate('/'))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={canGoBack ? 'chevron-back' : 'home-outline'}
        size={Sizes.icon * scale}
        color={Colors.primary}
      />
      <AppText variant="button" color="primary">
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Sizes.tapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingRight: Spacing.md,
    borderRadius: Radius.button,
  },
  pressed: {
    backgroundColor: Colors.primaryTint,
  },
});
