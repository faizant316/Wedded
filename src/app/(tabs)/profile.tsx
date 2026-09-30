import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { ListRow, ListSection } from '@/components/list';
import { NavScreen } from '@/components/nav';
import { PressableScale } from '@/components/pressable-scale';
import { StateView } from '@/components/state-view';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useMyInquiries } from '@/data/inquiries';
import { useSession } from '@/features/auth/session';
import type { Locale } from '@/i18n';
import { useLocale } from '@/i18n/locale-context';
import { formatPhone } from '@/lib/phone';
import { selectionHaptic } from '@/lib/haptics';

const LANGUAGES: { locale: Locale; labelKey: string }[] = [
  { locale: 'en', labelKey: 'profile.english' },
  { locale: 'pa', labelKey: 'profile.punjabi' },
];

/**
 * S16 Profile, laid out like iOS Settings: the account card at the top (the
 * Apple Account row), then grouped rows for inquiries, language and the
 * account actions.
 */
export default function ProfileScreen() {
  const { locale, setLocale, t } = useLocale();

  return (
    <NavScreen title={t('tabs.profile')} back={false}>
      <AccountSection />

      <ListSection header={t('profile.language')}>
        {LANGUAGES.map((language) => (
          <ListRow
            key={language.locale}
            title={t(language.labelKey)}
            titleLang={language.locale}
            accessibilityRole="radio"
            checked={language.locale === locale}
            onPress={() => {
              if (language.locale !== locale) selectionHaptic();
              setLocale(language.locale);
            }}
          />
        ))}
      </ListSection>

      <ListSection>
        <ListRow title={t('profile.textSize')} value={t('common.comingSoon')} />
      </ListSection>
    </NavScreen>
  );
}

/** Sign in, finish setting up, or the signed-in person's details. */
function AccountSection() {
  const { t } = useLocale();
  const { status, profile, email, reloadProfile, signOut } = useSession();
  const inquiries = useMyInquiries();

  if (status === 'loading') {
    return <StateView state="loading" style={styles.state} />;
  }
  if (status === 'error') {
    return <StateView state="error" onRetry={reloadProfile} style={styles.state} />;
  }
  if (status === 'signedOut' || status === 'needsProfile' || !profile) {
    const signedOut = status === 'signedOut';
    return (
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={signedOut ? t('profile.account.signIn') : t('profile.account.finish')}
        onPress={() => router.push('/sign-in')}
        style={styles.accountCard}
      >
        <View style={[styles.avatar, styles.avatarEmpty]}>
          <Icon name="person" size={30} color={Colors.onPrimary} />
        </View>
        <View style={styles.accountText}>
          <AppText variant="heading" weight={600} color="primary">
            {signedOut ? t('profile.account.signInTitle') : t('profile.account.finishTitle')}
          </AppText>
          <AppText variant="label" weight={400} color="text2">
            {signedOut ? t('profile.account.signInBody') : t('profile.account.finishBody')}
          </AppText>
        </View>
        <Icon name="chevron-forward" size={17} color={Colors.chevron} weight="semibold" />
      </PressableScale>
    );
  }

  const initials = profile.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

  return (
    <>
      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <AppText variant="section" color="onPrimary">
            {initials}
          </AppText>
        </View>
        <View style={styles.accountText}>
          <AppText variant="heading" weight={600}>
            {profile.full_name}
          </AppText>
          {email && (
            <AppText variant="label" weight={400} color="text2">
              {email}
            </AppText>
          )}
          <AppText variant="label" weight={400} color="text2">
            {[formatPhone(profile.phone), profile.city].join(' · ')}
          </AppText>
        </View>
      </View>

      <ListSection inset>
        <ListRow
          title={t('profile.account.myInquiries')}
          icon="chatbubbles-outline"
          value={inquiries.data ? String(inquiries.data.length) : undefined}
          accessibilityLabel={
            inquiries.data
              ? t('profile.account.myInquiriesCount', { count: inquiries.data.length })
              : t('profile.account.myInquiries')
          }
          onPress={() => router.push('/my-inquiries')}
        />
        <ListRow
          title={t('profile.account.edit')}
          icon="person-circle-outline"
          onPress={() => router.push({ pathname: '/sign-in', params: { mode: 'edit' } })}
        />
      </ListSection>

      <ListSection>
        <ListRow title={t('profile.account.signOut')} tone="primary" onPress={signOut} />
        <ListRow
          title={t('profile.account.deleteAccount')}
          tone="error"
          onPress={() => router.push('/delete-account')}
        />
      </ListSection>
    </>
  );
}

const styles = StyleSheet.create({
  state: {
    paddingVertical: Spacing.xl,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.circle,
    backgroundColor: Colors.primary,
  },
  avatarEmpty: {
    backgroundColor: Colors.textDisabled,
  },
  accountText: {
    flex: 1,
    gap: 2,
  },
});
