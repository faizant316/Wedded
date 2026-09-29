import Ionicons from '@expo/vector-icons/Ionicons';
import type { AuthError } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { TextField } from '@/components/text-field';
import { Colors, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';
import { formatPhone } from '@/lib/phone';
import { supabase } from '@/lib/supabase';

import { AboutYouForm, type AboutYouValues } from './about-you-form';
import { isValidEmail, toLatinDigits } from './about-you-validation';
import { useSession } from './session';

const CODE_LENGTH = 6;
/** Supabase lets an address ask for a new code once a minute. */
const RESEND_SECONDS = 60;

type Step = 'email' | 'code';

/** i18n key for a Supabase Auth error, in words a family understands. */
function authErrorKey(error: AuthError): string {
  if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
    return 'signIn.errors.tooMany';
  }
  // Supabase uses otp_expired for both expired and mistyped codes.
  if (error.code === 'otp_expired') return 'signIn.errors.codeWrong';
  if (error.name === 'AuthRetryableFetchError') return 'signIn.errors.network';
  return 'signIn.errors.generic';
}

export type SignInMode = 'signIn' | 'edit';

/**
 * Sign-in and account setup in one modal (vision S13 and S14): email, then the
 * 6-digit code from the email, then About you if they don't have a profile yet.
 * New and returning people take the same path; there is no password. In edit
 * mode it opens straight on About you with their details filled in.
 */
export function SignInFlow({ mode }: { mode: SignInMode }) {
  const { t } = useLocale();
  const { status, reloadProfile, finishSignIn, cancelSignIn } = useSession();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const finished = useRef(false);

  // Signed in without a profile (the code was just accepted, or they came
  // from Profile to finish setting up), or editing: About you.
  const showAboutYou = mode === 'edit' || status === 'needsProfile';

  // Signed in with a profile, i.e. a returning person: nothing more to ask.
  useEffect(() => {
    if (mode === 'edit' || finished.current) return;
    if (status === 'signedIn') {
      finished.current = true;
      finishSignIn();
    }
  }, [mode, status, finishSignIn]);

  // Closing the sheet without finishing forgets the action that was waiting.
  useEffect(() => () => cancelSignIn(), [cancelSignIn]);

  function close() {
    if (router.canGoBack()) router.back();
  }

  let content;
  if (showAboutYou) {
    content = (
      <AboutYouStep
        onDone={() => {
          finished.current = true;
          finishSignIn();
        }}
      />
    );
  } else if (status === 'error') {
    content = <StateView state="error" onRetry={reloadProfile} />;
  } else if (status === 'signedIn' || (step === 'code' && status === 'loading')) {
    content = <StateView state="loading" message={t('signIn.signingIn')} />;
  } else if (step === 'email') {
    content = (
      <EmailStep
        initialEmail={email}
        onSent={(sentTo) => {
          setEmail(sentTo);
          setStep('code');
        }}
      />
    );
  } else {
    content = <CodeStep email={email} onChangeEmail={() => setStep('email')} />;
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('signIn.close')}
          onPress={close}
          style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
        >
          <Ionicons name="close" size={Sizes.icon + 4} color={Colors.text} />
        </Pressable>
      </View>
      {content}
    </Screen>
  );
}

function EmailStep({
  initialEmail,
  onSent,
}: {
  initialEmail: string;
  onSent: (email: string) => void;
}) {
  const { t } = useLocale();
  const [email, setEmail] = useState(initialEmail);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();

  async function send() {
    const clean = email.trim().toLowerCase();
    if (!isValidEmail(clean)) {
      setError(t('signIn.errors.emailInvalid'));
      return;
    }
    setError(undefined);
    setSending(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (authError) {
      setError(t(authErrorKey(authError)));
      return;
    }
    onSent(clean);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <AppText variant="title" accessibilityRole="header">
        {t('signIn.title')}
      </AppText>
      <AppText variant="bodyLg" color="text2">
        {t('signIn.subtitle')}
      </AppText>
      <TextField
        type="email"
        label={t('signIn.email')}
        value={email}
        onChangeText={setEmail}
        error={error}
        maxLength={254}
        autoFocus
        returnKeyType="send"
        submitBehavior="blurAndSubmit"
        onSubmitEditing={send}
      />
      <Button label={t('signIn.sendCode')} icon="mail-outline" loading={sending} onPress={send} />
    </ScrollView>
  );
}

function CodeStep({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const { t } = useLocale();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // On success the session changes and SignInFlow moves on by itself.
  async function verify(token: string) {
    if (token.length !== CODE_LENGTH) {
      setError(t('signIn.errors.codeLength'));
      return;
    }
    setError(undefined);
    setNotice(undefined);
    setVerifying(true);
    const { error: authError } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    setVerifying(false);
    if (authError) {
      const message = t(authErrorKey(authError));
      setError(message);
      setCode('');
      AccessibilityInfo.announceForAccessibility(message);
    }
  }

  function changeCode(text: string) {
    const digits = toLatinDigits(text).replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (digits.length === CODE_LENGTH && !verifying) {
      void verify(digits);
    }
  }

  async function resend() {
    setError(undefined);
    setResending(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setResending(false);
    if (authError) {
      setError(t(authErrorKey(authError)));
      return;
    }
    setCooldown(RESEND_SECONDS);
    setNotice(t('signIn.newCodeSent'));
    AccessibilityInfo.announceForAccessibility(t('signIn.newCodeSent'));
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <AppText variant="title" accessibilityRole="header">
        {t('signIn.checkEmail')}
      </AppText>
      <AppText variant="bodyLg">{t('signIn.codeSentTo', { email })}</AppText>
      <TextField
        label={t('signIn.code')}
        value={code}
        onChangeText={changeCode}
        error={error}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={12}
        autoFocus
      />
      {notice && <AppText color="success">{notice}</AppText>}
      <Button label={t('signIn.verify')} loading={verifying} onPress={() => verify(code)} />
      <AppText color="text2">{t('signIn.checkSpam')}</AppText>
      <Button
        variant="text"
        label={cooldown > 0 ? t('signIn.resendIn', { seconds: cooldown }) : t('signIn.resend')}
        disabled={cooldown > 0}
        loading={resending}
        onPress={resend}
      />
      <Button variant="text" label={t('signIn.changeEmail')} onPress={onChangeEmail} />
    </ScrollView>
  );
}

function AboutYouStep({ onDone }: { onDone: () => void }) {
  const { t } = useLocale();
  const { session, email, profile, profileSaved } = useSession();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  if (!session) {
    return <StateView state="loading" />;
  }
  const userId = session.user.id;

  async function save(values: AboutYouValues) {
    setError(undefined);
    setSaving(true);
    const { data, error: saveError } = await supabase
      .from('profiles')
      .upsert({ id: userId, full_name: values.name, city: values.city, phone: values.phone })
      .select()
      .single();
    setSaving(false);
    if (saveError || !data) {
      setError(t('aboutYou.saveFailed'));
      return;
    }
    profileSaved(data);
    onDone();
  }

  return (
    <AboutYouForm
      initialValues={{
        email: email ?? '',
        name: profile?.full_name,
        city: profile?.city,
        phone: profile ? formatPhone(profile.phone) : undefined,
      }}
      emailLocked
      confirmedAdult={!!profile}
      submitLabel={profile ? t('aboutYou.save') : undefined}
      submitting={saving}
      error={error}
      onSubmit={save}
    />
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: Spacing.sm,
  },
  close: {
    width: Sizes.tapTarget,
    height: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Sizes.tapTarget / 2,
  },
  closePressed: {
    backgroundColor: Colors.primaryTint,
  },
  content: {
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
});
