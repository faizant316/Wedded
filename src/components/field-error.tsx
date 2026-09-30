import { StyleSheet, View } from 'react-native';

import { AppText, useFontScale, useTypeStyle } from '@/components/app-text';
import { Icon } from '@/components/icon';
import { Colors, Sizes, Spacing } from '@/constants/theme';

/** Red error line under a form control, with an icon so colour isn't the only signal. */
export function FieldError({ message }: { message: string }) {
  const scale = useFontScale('body');
  const { lineHeight } = useTypeStyle({ text: message });

  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      {/* Level with the first line when a long message wraps. */}
      <View style={[styles.icon, { height: lineHeight * scale }]}>
        <Icon name="alert-circle" size={Sizes.iconSmall * scale} color={Colors.error} />
      </View>
      <AppText color="error" weight={500} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  icon: {
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
