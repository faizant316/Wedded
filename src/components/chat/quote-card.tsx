import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { makeStyles, Radius, Spacing } from '@/constants/theme';
import type { ChatQuote } from '@/features/chat/chat-types';
import { formatDate } from '@/features/inquiry/inquiry-helpers';
import { usd } from '@/features/vendors/profile-format';
import { useLocale } from '@/i18n/locale-context';

/**
 * A vendor's quote in the thread: the price large, what it's for (event, date,
 * guests), their note and how long it's good for. The family gets Accept and
 * Ask a question; the vendor sees the same card without buttons.
 */
export function QuoteCard({
  quote,
  eventName,
  onAccept,
  onAsk,
}: {
  quote: ChatQuote;
  /** The event's name in the app's language, when the quote is for one. */
  eventName?: string | null;
  onAccept?: () => void;
  onAsk?: () => void;
}) {
  const styles = useStyles();
  const { t } = useLocale();
  const unit = quote.unit ? ` / ${t(`vendorCard.units.${quote.unit}`)}` : '';
  const rows = [
    quote.date ? { label: t('chat.quote.date'), value: formatDate(quote.date) } : null,
    quote.guests ? { label: t('chat.quote.guests'), value: quote.guests } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <View style={styles.card}>
      <AppText variant="label" weight={600} color="text2">
        {t('chat.quote.title')}
      </AppText>
      <AppText variant="title" style={styles.tabular}>
        {`${usd.format(quote.amount)}${unit}`}
      </AppText>
      {eventName && <AppText weight={600}>{t('chat.quote.for', { event: eventName })}</AppText>}
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <AppText color="text2">{row.label}</AppText>
          <AppText weight={600} style={styles.value}>
            {row.value}
          </AppText>
        </View>
      ))}
      {quote.note && <AppText>{quote.note}</AppText>}
      {quote.validUntil && (
        <AppText variant="label" weight={400} color="text2">
          {t('chat.quote.validUntil', { date: formatDate(quote.validUntil) })}
        </AppText>
      )}
      {(onAccept || onAsk) && (
        <View style={styles.actions}>
          {onAccept && <Button label={t('chat.quote.accept')} onPress={onAccept} />}
          {onAsk && <Button variant="secondary" label={t('chat.quote.ask')} onPress={onAsk} />}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    boxShadow: `inset 0 0 0 1.5px ${Colors.primaryTint}`,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
}));
