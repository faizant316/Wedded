import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, useFontScale, useTypeStyle, type AppTextProps } from '@/components/app-text';
import { Colors, Sizes, Spacing } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * An icon and a line of text, like "Based in Yuba City" with a pin. The icon
 * stays level with the first line when the text wraps at large sizes.
 */
export function IconLine({
  icon,
  children,
  color = 'text',
}: {
  icon: IoniconName;
  children: string;
  color?: AppTextProps['color'];
}) {
  const scale = useFontScale('body');
  const { lineHeight } = useTypeStyle({ text: children });

  return (
    <View style={styles.row}>
      <View style={[styles.icon, { height: lineHeight * scale }]}>
        <Ionicons name={icon} size={Sizes.icon * scale} color={Colors.text2} />
      </View>
      <AppText color={color} style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  icon: {
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
