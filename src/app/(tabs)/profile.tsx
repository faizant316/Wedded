import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { Colors, Radius, Sizes, Spacing } from '@/constants/theme';
import { useSession } from '@/features/auth/session';
import type { Locale } from '@/i18n';
import { useLocale } from '@/i18n/locale-context';
import { formatPhone } from '@/lib/phone';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const LANGUAGES: { locale: Locale; labelKey: string }[] = [
  { locale: 'en', labelKey: 'profile.english' },
  { locale: 'pa', labelKey: 'profile.punjabi' },
];

export default function ProfileScreen() {
  const { locale, setLocale, t } = useLocale();

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title" accessibilityRole="header">
          {t('tabs.profile')}
        </AppText>

        <AccountSection />

        <AppText variant="heading" accessibilityRole="header">
          {t('profile.language')}
        </AppText>
        <View style={styles.cards} accessibilityRole="radiogroup">
          {LANGUAGES.map((language) => {
            const selected = language.locale === locale;
            return (
              <Pressable
                key={language.locale}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setLocale(language.locale)}
                style={[styles.card, selected && styles.cardSelected]}
              >
                <AppText variant="heading" lang={language.locale}>
                  {t(language.labelKey)}
                </AppText>
                {selected && <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />}
              </Pressable>
            );
          })}
        </View>

        <AppText variant="heading" accessibilityRole="header">
          {t('profile.textSize')}
        </AppText>
        <AppText color="text2">{t('common.comingSoon')}</AppText>
      </ScrollView>
    </Screen>
  );
}

/** Sign in, finish setting up, or the signed-in person's details. */
function AccountSection() {
  const { t } = useLocale();
  const { status, profile, email, reloadProfile, signOut } = useSession();

  if (status === 'loading') {
    return <StateView state="loading" style={styles.state} />;
  }
  if (status === 'error') {
    return <StateView state="error" onRetry={reloadProfile} style={styles.state} />;
  }
  if (status === 'signedOut') {
    return (
      <Card style={styles.account}>
        <AppText variant="heading">{t('profile.account.signInTitle')}</AppText>
        <AppText color="text2">{t('profile.account.signInBody')}</AppText>
        <Button
          label={t('profile.account.signIn')}
          icon="mail-outline"
          onPress={() => router.push('/sign-in')}
        />
      </Card>
    );
  }
  if (status === 'needsProfile' || !profile) {
    return (
      <Card style={styles.account}>
        <AppText variant="heading">{t('profile.account.finishTitle')}</AppText>
        <AppText color="text2">{t('profile.account.finishBody')}</AppText>
        <Button label={t('profile.account.finish')} onPress={() => router.push('/sign-in')} />
      </Card>
    );
  }

  return (
    <Card style={styles.account}>
      <AppText variant="heading">{profile.full_name}</AppText>
      <Detail icon="location-outline" text={profile.city} />
      <Detail icon="call-outline" text={formatPhone(profile.phone)} />
      {email && <Detail icon="mail-outline" text={email} />}
      <Button
        variant="secondary"
        label={t('profile.account.edit')}
        onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'edit' } })}
      />
      <Button variant="text" label={t('profile.account.signOut')} onPress={signOut} />
    </Card>
  );
}

function Detail({ icon, text }: { icon: IoniconName; text: string }) {
  return (
    <View style={styles.detail}>
      <Ionicons name={icon} size={Sizes.iconSmall} color={Colors.text2} />
      <AppText style={styles.detailText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  account: {
    gap: Spacing.md,
  },
  state: {
    paddingVertical: Spacing.xl,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    flexShrink: 1,
  },
  cards: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.card,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTint,
  },
});
