import { Stack } from 'expo-router';

import { useColors } from '@/constants/theme';

/**
 * The first questions for a family (after the welcome screen, or "Start
 * planning" on Home), one screen each so Back and the swipe-back gesture
 * work like any iPhone app.
 */
export default function OnboardingLayout() {
  const Colors = useColors();
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.canvas } }}
    />
  );
}
