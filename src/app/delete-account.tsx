import Ionicons from '@expo/vector-icons/Ionicons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { FieldError } from '@/components/field-error';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { Colors, Sizes, Spacing } from '@/constants/theme';
import { toLatinDigits } from '@/features/auth/about-you-validation';
import { useSession } from '@/features/auth/session';
import { useLocale } from '@/i18n/locale-context';
import { supabase } from '@/lib/supabase';

const CODE_LENGTH = 6;

/**
 * Delete account (vision S19, required by Apple): screen 1 says plainly what
 * is removed and offers signing out instead; screen 2 confirms with a fresh
 * email code (no English typing, and a grandchild can't do it by accident).
 * The delete-account Edge Function checks the code is fresh, then deletes.
 */
export default function DeleteAccountScreen() {
  const { t } = useLocale();
  const { email, signOut } = useSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'explain' | 'code'>('explain');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  function close() {
    if (router.canGoBack()) router.back();
  }

  async function sendCode() {
    if (!email) return;
    setBusy(true);
    setError(undefined);
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (sendError) {
      setError(t(sendError.status === 429 ? 'signIn.errors.tooMany' : 'signIn.errors.generic'));
      return;
    }
    setStep('code');
  }

  async function confirm(token: string) {
    if (!email) return;
    if (token.length !== CODE_LENGTH) {
      setError(t('signIn.errors.codeLength'));
      return;
    }
    setBusy(true);
    setError(undefined);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (verifyError) {
      setBusy(false);
      setCode('');
      setError(t('signIn.errors.codeWrong'));
      return;
    }
    const { error: deleteError } = await supabase.functions.invoke('delete-account', { body: {} });
    if (deleteError) {
      setBusy(false);
      setError(t('deleteAccount.failed'));
      return;
    }
    // The account is gone: forget it on this phone and go Home, logged out.
    queryClient.clear();
    await supabase.auth.signOut({ scope: 'local' });
    router.dismissAll();
    router.replace('/');
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('signIn.close')}
          onPress={close}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}
        >
          <Ionicons name="close" size={Sizes.icon + 4} color={Colors.text} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="title" accessibilityRole="header">
          {t('deleteAccount.title')}
        </AppText>

        {step === 'explain' ? (
          <>
            <Card style={styles.list}>
              <AppText weight={700}>{t('deleteAccount.removes')}</AppText>
              {['profile', 'saved', 'inquiries'].map((item) => (
                <View key={item} style={styles.row}>
                  <Ionicons
                    name="close-circle-outline"
                    size={Sizes.iconSmall}
                    color={Colors.error}
                  />
                  <AppText style={styles.grow}>{t(`deleteAccount.items.${item}`)}</AppText>
                </View>
              ))}
            </Card>
            <AppText color="text2">{t('deleteAccount.vendorsKeep')}</AppText>
            <Card style={styles.list}>
              <AppText>{t('deleteAccount.preferSignOut')}</AppText>
              <Button
                variant="secondary"
                label={t('profile.account.signOut')}
                onPress={async () => {
                  await signOut();
                  close();
                }}
              />
            </Card>
            {error && <FieldError message={error} />}
            <Button
              variant="danger"
              icon="trash-outline"
              label={t('deleteAccount.delete')}
              loading={busy}
              onPress={sendCode}
            />
          </>
        ) : (
          <>
            <AppText variant="bodyLg">
              {t('deleteAccount.codeSent', { email: email ?? '' })}
            </AppText>
            <TextField
              label={t('signIn.code')}
              value={code}
              onChangeText={(text) => {
                const digits = toLatinDigits(text).replace(/\D/g, '').slice(0, CODE_LENGTH);
                setCode(digits);
                setError(undefined);
              }}
              error={error}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={12}
              autoFocus
            />
            <Button
              variant="danger"
              icon="trash-outline"
              label={t('deleteAccount.confirm')}
              loading={busy}
              onPress={() => confirm(code)}
            />
            <Button variant="text" label={t('deleteAccount.keep')} onPress={close} />
          </>
        )}
      </ScrollView>
    </Screen>
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
  pressed: {
    backgroundColor: Colors.primaryTint,
  },
  content: {
    gap: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  list: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  grow: {
    flex: 1,
  },
});
