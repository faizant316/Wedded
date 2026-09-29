import {
  MuktaMahee_500Medium,
  MuktaMahee_600SemiBold,
  MuktaMahee_700Bold,
  MuktaMahee_800ExtraBold,
} from '@expo-google-fonts/mukta-mahee';
import {
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { queryClient } from '@/data/query-client';
import { SessionProvider } from '@/features/auth/session';
import { SearchLocationProvider } from '@/features/location/search-location';
import { LocaleProvider } from '@/i18n/locale-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Fonts load at runtime so the app runs in Expo Go. Both scripts are gated
  // behind the splash screen so no screen ever renders in a system fallback.
  const [fontsLoaded, fontError] = useFonts({
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    MuktaMahee_500Medium,
    MuktaMahee_600SemiBold,
    MuktaMahee_700Bold,
    MuktaMahee_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <SessionProvider>
          <SearchLocationProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.bg } }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="sign-in" options={{ presentation: 'modal' }} />
              <Stack.Screen name="save-vendor" options={{ presentation: 'modal' }} />
              <Stack.Screen name="location" options={{ presentation: 'modal' }} />
              <Stack.Screen name="ask" options={{ presentation: 'modal' }} />
              <Stack.Screen name="ask-sent" options={{ presentation: 'modal' }} />
              <Stack.Screen name="delete-account" options={{ presentation: 'modal' }} />
            </Stack>
          </SearchLocationProvider>
        </SessionProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
