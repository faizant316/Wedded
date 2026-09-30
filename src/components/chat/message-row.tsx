import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { makeStyles, Radius, Spacing } from '@/constants/theme';
import { useLocale } from '@/i18n/locale-context';

/** "2:05 PM". Times keep Latin digits in both languages (vision §4). */
export function formatClock(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

/**
 * One message's place in a thread: mine on the right, theirs on the left, at
 * most four fifths of the width, and under the last of a run its time (and
 * "Seen" when the other side has read it). Holds a bubble or a card.
 */
export function MessageRow({
  mine,
  last,
  seen,
  createdAt,
  wide = false,
  children,
}: {
  /** Cards (quote, menu, inquiry) take the row's full width instead of shrinking to fit. */
  wide?: boolean;
  mine: boolean;
  last: boolean;
  seen: boolean;
  createdAt: string;
  children: ReactNode;
}) {
  const styles = useStyles();
  const { t } = useLocale();
  return (
    <View
      style={[
        styles.row,
        wide && styles.wide,
        mine ? styles.mine : styles.theirs,
        last && styles.runEnd,
      ]}
    >
      <View style={[styles.content, wide && styles.fill]}>{children}</View>
      {last && (
        <AppText variant="caption" color="text2" style={mine ? styles.metaMine : null}>
          {seen ? `${formatClock(createdAt)} · ${t('chat.seen')}` : formatClock(createdAt)}
        </AppText>
      )}
    </View>
  );
}

/**
 * A text bubble: the app colour for mine, white for theirs, with the corner
 * nearest the next bubble tucked in when several come in a row.
 */
export function TextBubble({
  text,
  mine,
  first,
  last,
}: {
  text: string;
  mine: boolean;
  first: boolean;
  last: boolean;
}) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.bubble,
        mine ? styles.bubbleMine : styles.bubbleTheirs,
        mine ? !last && styles.tuckMineBottom : !last && styles.tuckTheirsBottom,
        mine ? !first && styles.tuckMineTop : !first && styles.tuckTheirsTop,
      ]}
    >
      <AppText variant="bodyLg" color={mine ? 'onPrimary' : 'text'} selectable>
        {text}
      </AppText>
    </View>
  );
}

/** A photo sent in chat; tap to see it full screen. */
export function PhotoBubble({
  url,
  label,
  onPress,
}: {
  url: string;
  label: string;
  onPress?: () => void;
}) {
  const styles = useStyles();
  return (
    <Pressable accessibilityRole="imagebutton" accessibilityLabel={label} onPress={onPress}>
      <Image source={{ uri: url }} contentFit="cover" accessible={false} style={styles.photo} />
    </Pressable>
  );
}

const BIG = 20;
const TUCK = 6;

const useStyles = makeStyles((Colors) => ({
  row: {
    maxWidth: '82%',
    gap: 3,
    marginTop: 2,
  },
  mine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  wide: {
    width: '86%',
    maxWidth: 420,
  },
  fill: {
    alignSelf: 'stretch',
  },
  runEnd: {
    marginBottom: Spacing.sm,
  },
  content: {
    maxWidth: '100%',
  },
  metaMine: {
    textAlign: 'right',
  },
  bubble: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BIG,
    borderCurve: 'continuous',
  },
  bubbleMine: {
    backgroundColor: Colors.primaryFill,
  },
  bubbleTheirs: {
    backgroundColor: Colors.surface,
  },
  tuckMineBottom: { borderBottomRightRadius: TUCK },
  tuckMineTop: { borderTopRightRadius: TUCK },
  tuckTheirsBottom: { borderBottomLeftRadius: TUCK },
  tuckTheirsTop: { borderTopLeftRadius: TUCK },
  photo: {
    width: 240,
    height: 240,
    borderRadius: Radius.photo,
    backgroundColor: Colors.skeleton,
  },
}));
