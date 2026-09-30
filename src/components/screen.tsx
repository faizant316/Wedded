import { View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles, Sizes } from '@/constants/theme';

type ScreenProps = ViewProps & {
  edges?: readonly Edge[];
};

/**
 * The grey grouped page background with safe-area padding, for sheets and
 * simple pages. Scrolling pages with a title use NavScreen (components/nav)
 * instead, which scrolls under a floating bar.
 */
export function Screen({ edges = ['top'], style, children, ...rest }: ScreenProps) {
  const styles = useStyles();
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((Colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.pageGutter,
  },
}));
