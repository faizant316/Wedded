import { Stack } from 'expo-router';

import { useColors } from '@/constants/theme';

// Home is the first screen of this tab's stack, so a deep link to an event
// (/e/jaago) still has Home underneath it and Back goes somewhere sensible.
export const unstable_settings = {
  anchor: 'index',
};

/**
 * The Home tab's stack: Home, then the Event page and results pushed on top,
 * with the tab bar still showing. Screens draw their own Back button.
 */
export default function HomeStackLayout() {
  const Colors = useColors();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
  );
}
