import { useEffect } from 'react';
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
import { Icon, type IconName } from '@/components/icon';
import { Sizes, Spacing, useColors } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

type Common = {
  /** One plain sentence. Loading and error have friendly defaults. */
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export type StateViewProps =
  | (Common & { state: 'loading' })
  | (Common & {
      state: 'empty';
      message: string;
      icon?: IconName;
      /** The one next step, e.g. "Widen to 50 mi". */
      action?: { label: string; onPress: () => void };
    })
  | (Common & { state: 'error'; onRetry?: () => void });

/**
 * One component for "still loading", "nothing here" and "something went
 * wrong", laid out like iOS's ContentUnavailableView: a large grey symbol,
 * one sentence and at most one action. Errors always say what to do next and
 * offer Try again when `onRetry` is given.
 * For lists, prefer a skeleton shaped like the content over the loading state.
 */
export function StateView(props: StateViewProps) {
  const Colors = useColors();
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
        style={[styles.container, style]}
      >
        <ActivityIndicator size="large" color={Colors.chevron} />
        <AppText color="text2" style={styles.message}>
          {message}
        </AppText>
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
      <Icon name={icon} size={Sizes.iconLarge} color={Colors.chevron} />
      <AppText variant="bodyLg" weight={500} style={styles.message}>
        {message}
      </AppText>
      {action && (
        <Button
          variant="secondary"
          icon={state === 'error' ? 'refresh' : undefined}
          label={action.label}
          onPress={action.onPress}
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  message: {
    textAlign: 'center',
  },
  action: {
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
  },
});
