import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

// Search is the first screen of this tab's stack, so a deep link to results
// opened from Search still has Search underneath it.
export const unstable_settings = {
  anchor: 'search',
};

/**
 * The Search tab's stack: Search, then results pushed on top with the tab bar
 * still showing. Results are shared with Home through the (home,search) group.
 */
export default function SearchStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }} />
  );
}
