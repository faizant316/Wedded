import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, type ComponentProps } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { SkeletonCards } from '@/components/skeleton';
import { Colors, gradient, Gradients, Radius, Sizes, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type Common = {
  /** One plain sentence. Loading and error have friendly defaults. */
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export type StateViewProps =
  | (Common & {
      state: 'loading';
      /** cards (default): pulsing card shapes. spinner: for dark screens like the photo viewer. */
      look?: 'cards' | 'spinner';
    })
  | (Common & {
      state: 'empty';
      message: string;
      icon?: IoniconName;
      /** The one next step, e.g. "Widen to 50 mi". */
      action?: { label: string; onPress: () => void };
    })
  | (Common & { state: 'error'; onRetry?: () => void });

/**
 * One component for "still loading", "nothing here" and "something went
 * wrong". Every state is one sentence and at most one action; errors always
 * say what to do next and offer Try again when `onRetry` is given.
 * For lists, prefer a skeleton shaped like the content over the loading state.
 */
export function StateView(props: StateViewProps) {
  const { t } = useLocale();
  const { state, style } = props;
  const message = props.message ?? (state === 'error' ? t('states.error') : t('states.loading'));

  // Screen readers don't notice a view that replaces the content, so say it.
  useEffect(() => {
    if (state === 'error') {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [state, message]);

  if (state === 'loading') {
    return (
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={message}
        accessibilityState={{ busy: true }}
        style={[props.look === 'spinner' ? styles.container : styles.skeleton, style]}
      >
        {props.look === 'spinner' ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <SkeletonCards />
        )}
      </View>
    );
  }

  const icon = state === 'error' ? 'cloud-offline-outline' : (props.icon ?? 'search-outline');
  const action =
    state === 'error'
      ? props.onRetry && { label: t('states.tryAgain'), onPress: props.onRetry }
      : props.action;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={Sizes.iconLarge} color={Colors.primary} />
      </View>
      <AppText variant="bodyLg" style={styles.message}>
        {message}
      </AppText>
      {action && (
        <Button
          variant="secondary"
          icon={state === 'error' ? 'refresh' : undefined}
          label={action.label}
          onPress={action.onPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  skeleton: {
    paddingVertical: Spacing.sm,
  },
  iconCircle: {
    alignSelf: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.circle,
    backgroundColor: Colors.accentTint,
    ...gradient(Gradients.iconWash),
  },
  message: {
    textAlign: 'center',
  },
});
