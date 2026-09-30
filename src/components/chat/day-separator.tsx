import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Spacing } from '@/constants/theme';
import { formatDate } from '@/features/inquiry/inquiry-helpers';
import { relativeDay } from '@/features/chat/thread-layout';
import { useLocale } from '@/i18n/locale-context';

/** "Today", "Yesterday" or "Tue, Sep 29, 2026", centred between days of messages. */
export function DaySeparator({ day }: { day: string }) {
  const { t } = useLocale();
  const relative = relativeDay(day);
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <AppText variant="caption" weight={600} color="text2">
        {relative ? t(`chat.${relative}`) : formatDate(day)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
