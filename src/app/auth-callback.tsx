import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { useSession } from '@/features/auth/session';
import { useLocale } from '@/i18n/locale-context';

/**
 * Where Google sign-in comes back to (features/auth/providers.ts).
 *
 * Web: the whole page came back from Google with the session in the address,
 * which the Supabase client reads by itself. Wait for it, then About you if
 * there's no profile yet, or Home (or back to deleting the account when that's
 * what the sign-in was for).
 *
 * Phones: the sign-in finishes in providers.ts, but Android also opens this
 * address in the app, so just go back to where they were.
 */
export default function AuthCallbackScreen() {
  const { t } = useLocale();
  const { status } = useSession();
  const { next } = useLocalSearchParams<{ next?: string }>();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (router.canGoBack()) router.back();
      else router.replace('/');
      return;
    }
    if (status === 'loading') return;
    if (status === 'signedOut') {
      // Cancelled at Google, or the link was stale: back to the choices.
      router.replace('/sign-in');
    } else if (next === 'delete-account') {
      router.replace({ pathname: '/delete-account', params: { confirmed: 'google' } });
    } else if (status === 'signedIn') {
      router.replace('/');
    } else {
      // needsProfile (About you), or the profile couldn't load (sign-in retries).
      router.replace('/sign-in');
    }
  }, [status, next]);

  return (
    <Screen edges={['top', 'bottom']}>
      <StateView state="loading" message={t('signIn.signingIn')} />
    </Screen>
  );
}
