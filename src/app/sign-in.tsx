import { useLocalSearchParams } from 'expo-router';

import { SignInFlow } from '@/features/auth/sign-in-flow';

/**
 * Presented as a modal over the tabs (see src/app/_layout.tsx). With no
 * parameters it starts on the choice of Apple, Google, phone or email;
 * `?method=phone` or `?method=email` opens straight on that one, and
 * `?mode=edit` edits About you.
 */
export default function SignInScreen() {
  const { mode, method } = useLocalSearchParams<{ mode?: string; method?: string }>();
  return (
    <SignInFlow
      mode={mode === 'edit' ? 'edit' : 'signIn'}
      method={method === 'phone' || method === 'email' ? method : undefined}
    />
  );
}
