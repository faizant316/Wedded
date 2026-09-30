import type { Tabs } from 'expo-router';
import { createContext, useContext, useEffect, useState, type ComponentProps } from 'react';
import { Keyboard, Platform, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { Glass } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { makeStyles, Sizes, Spacing, Springs, useColors } from '@/constants/theme';

export type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

export type TabSpec = { name: string; label: string; icon: IconName; iconFilled: IconName };

const PADDING = 6;

/** How far the floating tab bar sits above the bottom edge. */
export function useTabBarOffset() {
  const insets = useSafeAreaInsets();
  // Level with where iOS 26 floats its tab bar: just above the home indicator.
  return Math.max(insets.bottom - 12, Spacing.md);
}

// The space a screen inside the tabs leaves at the bottom of its scroll
// content so the last row can scroll clear of the floating bar. Zero outside
// the tabs (the vendor profile, sheets).
const TabBarSpaceContext = createContext(0);
export const TabBarSpaceProvider = TabBarSpaceContext.Provider;

/** Bottom padding for a scroll view: clears the floating tab bar, or the home indicator. */
export function useBottomSpace() {
  const tabBarSpace = useContext(TabBarSpaceContext);
  const insets = useSafeAreaInsets();
  return Math.max(tabBarSpace, insets.bottom) + Spacing.xl;
}

/**
 * The iOS 26 tab bar: a glass capsule floating over the content, with a
 * highlight that springs to the selected tab. Labels are always visible and
 * at least 13 point (vision §5); the selected tab also gets its filled icon,
 * so colour isn't the only signal.
 */
export function GlassTabBar({
  state,
  descriptors,
  navigation,
  tabs,
}: TabBarProps & { tabs: TabSpec[] }) {
  const Colors = useColors();
  const styles = useStyles();
  const bottom = useTabBarOffset();
  const reduceMotion = useReducedMotion();
  const [width, setWidth] = useState(0);
  const itemWidth = width > 0 ? (width - PADDING * 2) / state.routes.length : 0;
  const x = useSharedValue(0);
  const keyboardShown = useKeyboardShown();

  useEffect(() => {
    const target = state.index * itemWidth;
    x.value = reduceMotion || itemWidth === 0 ? target : withSpring(target, Springs.snappy);
  }, [state.index, itemWidth, reduceMotion, x]);

  const highlight = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  // Android lifts the whole screen above the keyboard; the bar would ride on it.
  if (keyboardShown) return null;

  return (
    <View style={[styles.wrap, { bottom }]}>
      <Glass interactive style={styles.bar}>
        <View
          style={styles.items}
          accessibilityRole="tablist"
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        >
          {itemWidth > 0 && (
            <Animated.View style={[styles.highlight, { width: itemWidth }, highlight]} />
          )}
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const spec = tabs.find((tab) => tab.name === route.name);
            const label = spec?.label ?? descriptors[route.key].options.title ?? route.name;
            const color = focused ? Colors.primary : Colors.text;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                onPress={onPress}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                style={styles.item}
              >
                {spec && (
                  <Icon
                    name={focused ? spec.iconFilled : spec.icon}
                    size={Sizes.tabIcon}
                    color={color}
                    weight={focused ? 'semibold' : 'regular'}
                  />
                )}
                <AppText
                  variant="caption"
                  weight={600}
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                  style={{ color }}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Glass>
    </View>
  );
}

function useKeyboardShown() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', () => setShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return shown;
}

const useStyles = makeStyles((Colors) => ({
  wrap: {
    pointerEvents: 'box-none',
    position: 'absolute',
    left: Sizes.tabBarInset,
    right: Sizes.tabBarInset,
  },
  bar: {
    height: Sizes.tabBar,
    borderRadius: Sizes.tabBar / 2,
  },
  items: {
    flex: 1,
    flexDirection: 'row',
    padding: PADDING,
  },
  highlight: {
    pointerEvents: 'none',
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: (Sizes.tabBar - PADDING * 2) / 2,
    backgroundColor: Colors.fillPressed,
  },
  item: {
    flex: 1,
    minHeight: Sizes.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
}));
