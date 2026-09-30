import { Tabs } from 'expo-router';

import {
  GlassTabBar,
  TabBarSpaceProvider,
  useTabBarOffset,
  type TabSpec,
} from '@/components/tab-bar';
import { Sizes, Spacing, useColors } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

const TABS: (Omit<TabSpec, 'label'> & { labelKey: string })[] = [
  { name: '(home)', labelKey: 'tabs.home', icon: 'home-outline', iconFilled: 'home' },
  { name: 'discover', labelKey: 'tabs.discover', icon: 'compass-outline', iconFilled: 'compass' },
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
 * Bottom tabs: Home, Discover, Search, Saved, Profile, in a floating glass bar (the iOS
 * 26 tab bar) that content scrolls under. Labels are always visible and
 * bilingual through i18n. Expo Router's JS tabs draw it the same on iPhone,
 * Android and the web; the glass itself is the system material on iOS 26.
 */
export default function TabsLayout() {
  const Colors = useColors();
  const { t } = useLocale();
  const offset = useTabBarOffset();
  const tabs = TABS.map(({ labelKey, ...tab }) => ({ ...tab, label: t(labelKey) }));

  return (
    <TabBarSpaceProvider value={Sizes.tabBar + offset + Spacing.sm}>
      <Tabs
        tabBar={(props) => <GlassTabBar {...props} tabs={tabs} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.bg },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.label }} />
        ))}
      </Tabs>
    </TabBarSpaceProvider>
  );
}
