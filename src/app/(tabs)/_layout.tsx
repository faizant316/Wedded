import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Elevation, FontFamilies, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; labelKey: string; icon: IoniconName; iconFilled: IoniconName }[] = [
  { name: '(home)', labelKey: 'tabs.home', icon: 'home-outline', iconFilled: 'home' },
  { name: '(search)', labelKey: 'tabs.search', icon: 'search-outline', iconFilled: 'search' },
  { name: 'saved', labelKey: 'tabs.saved', icon: 'heart-outline', iconFilled: 'heart' },
  {
    name: 'profile',
    labelKey: 'tabs.profile',
    icon: 'person-circle-outline',
    iconFilled: 'person-circle',
  },
];

/**
 * Bottom tabs: Home, Search, Saved, Profile. Labels are always visible and
 * bilingual through i18n. Expo Router's JS tabs are used instead of native
 * tabs so the app runs in Expo Go for the first builds.
 */
export default function TabsLayout() {
  const { locale, t } = useLocale();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.bg },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text2,
        tabBarStyle: {
          height: Sizes.tabBar + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          backgroundColor: Colors.surface,
          borderTopWidth: 0,
          boxShadow: Elevation.bar,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamilies[locale][600],
          fontSize: 13,
          lineHeight: 18,
        },
        tabBarItemStyle: { minHeight: Sizes.tapTarget },
        // Room for the pill around the current tab's icon.
        tabBarIconStyle: { width: Sizes.tabIcon + Spacing.lg * 2, height: Sizes.tabIcon + 4 },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.labelKey),
            // The current tab's icon sits on a soft maroon pill, as well as
            // being filled, so the colour isn't the only signal.
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <Ionicons
                  name={focused ? tab.iconFilled : tab.icon}
                  size={Sizes.tabIcon}
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 2,
    borderRadius: Radius.chip,
  },
  iconPillActive: {
    backgroundColor: Colors.primaryTint,
  },
});
