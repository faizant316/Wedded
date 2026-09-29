import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors, gradient, Gradients, Radius, Sizes } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** A maroon icon on a rounded marigold wash, for category rows and tiles. */
export function IconTile({ icon }: { icon: IoniconName }) {
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={Sizes.icon} color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: Sizes.iconCircle,
    height: Sizes.iconCircle,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.tile,
    backgroundColor: Colors.accentTint,
    ...gradient(Gradients.iconWash),
  },
});
