import { useLocalSearchParams } from 'expo-router';

import { SignInFlow } from '@/features/auth/sign-in-flow';

/** Presented as a modal over the tabs (see src/app/_layout.tsx). `?mode=edit` edits About you. */
export default function SignInScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <SignInFlow mode={mode === 'edit' ? 'edit' : 'signIn'} />;
}
