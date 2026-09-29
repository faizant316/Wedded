import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontFamilies, Sizes } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; labelKey: string; icon: IoniconName; iconFilled: IoniconName }[] = [
  { name: 'index', labelKey: 'tabs.home', icon: 'home-outline', iconFilled: 'home' },
  { name: 'search', labelKey: 'tabs.search', icon: 'search-outline', iconFilled: 'search' },
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
          borderTopColor: Colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: FontFamilies[locale][600],
          fontSize: 13,
          lineHeight: 18,
        },
        tabBarItemStyle: { minHeight: Sizes.tapTarget },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.labelKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? tab.iconFilled : tab.icon}
                size={Sizes.tabIcon}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
