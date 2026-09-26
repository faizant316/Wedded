import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Sizes } from '@/constants/theme';

type ScreenProps = ViewProps & {
  edges?: readonly Edge[];
};

/** Cream page background with safe-area padding; every screen starts here. */
export function Screen({ edges = ['top'], style, children, ...rest }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.pageGutter,
  },
});
