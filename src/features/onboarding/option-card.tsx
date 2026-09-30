import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/app-text';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/pressable-scale';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import type { Locale } from '@/i18n';
import { selectionHaptic } from '@/lib/haptics';
import { Motion } from '@/lib/motion';

export type OptionCardProps = {
  label: string;
  labelLang?: Locale;
  /** A second line, e.g. the name in the other script. */
  detail?: string;
  detailLang?: Locale;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  /** 'radio' when picking one turns the others off; 'checkbox' when several can be on. */
  role?: 'radio' | 'checkbox';
  /** Its place in the list, so the cards arrive one after another. */
  index?: number;
};

/**
 * A big answer to tap in the first questions: a grey card with an icon and
 * the answer. Picking it tints it, fills the icon and pops a tick in.
 */
export function OptionCard({
  label,
  labelLang,
  detail,
  detailLang,
  icon,
  selected,
  onPress,
  role = 'radio',
  index = 0,
}: OptionCardProps) {
  const Colors = useColors();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const on = useSharedValue(selected ? 1 : 0);
  const [off, tint, edge, onEdge] = [
    Colors.canvasCard,
    Colors.primaryTint,
    Colors.canvasCard,
    Colors.primary,
  ];

  useEffect(() => {
    on.value = reduceMotion ? (selected ? 1 : 0) : withTiming(selected ? 1 : 0, { duration: 180 });
  }, [on, reduceMotion, selected]);

  const card = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [off, tint]),
    borderColor: interpolateColor(on.value, [0, 1], [edge, onEdge]),
  }));

  return (
    <Animated.View entering={Motion.stagger(index)}>
      <PressableScale
        accessibilityRole={role}
        accessibilityState={role === 'radio' ? { selected } : { checked: selected }}
        accessibilityLabel={detail ? `${label}, ${detail}` : label}
        pressedScale={0.97}
        onPress={() => {
          selectionHaptic();
          onPress();
        }}
      >
        <Animated.View style={[styles.card, card]}>
          {icon && (
            <View style={[styles.icon, selected && styles.iconOn]}>
              <Icon name={icon} size={22} color={selected ? Colors.onPrimary : Colors.primary} />
            </View>
          )}
          <View style={styles.text}>
            <AppText variant="bodyLg" weight={600} lang={labelLang}>
              {label}
            </AppText>
            {detail && (
              <AppText variant="label" weight={400} color="text2" lang={detailLang}>
                {detail}
              </AppText>
            )}
          </View>
          <View style={[styles.mark, selected && styles.markOn]}>
            {selected && (
              <Animated.View entering={Motion.popIn} exiting={Motion.popOut}>
                <Icon name="checkmark" size={15} color={Colors.onPrimary} weight="bold" />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </PressableScale>
    </Animated.View>
  );
}

const useStyles = makeStyles((Colors) => ({
  card: {
    minHeight: Sizes.row + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.photo,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryTint,
  },
  iconOn: {
    backgroundColor: Colors.primaryFill,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  mark: {
    width: Sizes.checkbox,
    height: Sizes.checkbox,
    borderRadius: Sizes.checkbox / 2,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: {
    borderColor: Colors.primaryFill,
    backgroundColor: Colors.primaryFill,
  },
}));
