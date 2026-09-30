import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { FieldError } from '@/components/field-error';
import { Screen } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { SheetHeader } from '@/components/sheet-header';
import { TextField } from '@/components/text-field';
import { Spacing } from '@/constants/theme';
import { sendErrorKind, useSendMessage } from '@/data/chat';
import { useLocale } from '@/i18n/locale-context';

type Unit = 'person' | 'plate' | 'event';
const UNITS: Unit[] = ['person', 'plate', 'event'];

/**
 * For a vendor in a chat: send the family a price as a quote card (amount per
 * person, plate or event, guests, a note). /chat-quote?id={conversation id}
 */
export default function ChatQuoteSheet() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocale();
  const send = useSendMessage(id);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<Unit>('person');
  const [guests, setGuests] = useState('');
  const [note, setNote] = useState('');
  const [attempted, setAttempted] = useState(false);

  const value = Number(amount.replace(/[^0-9.]/g, ''));
  const valid = Number.isFinite(value) && value > 0;

  function submit() {
    setAttempted(true);
    if (!valid) return;
    send.mutate(
      {
        kind: 'quote',
        quote: {
          amount: value,
          unit,
          guests: guests.trim() || undefined,
          note: note.trim() || undefined,
        },
      },
      { onSuccess: () => router.back() },
    );
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <SheetHeader onClose={() => router.canGoBack() && router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <AppText variant="title" accessibilityRole="header">
          {t('chat.quoteForm.title')}
        </AppText>
        <TextField
          label={t('chat.quoteForm.amount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          error={attempted && !valid ? t('chat.quoteForm.amountError') : undefined}
          maxLength={9}
        />
        <View style={styles.field}>
          <AppText variant="label" weight={600}>
            {t('chat.quoteForm.per')}
          </AppText>
          <Segmented<Unit>
            accessibilityLabel={t('chat.quoteForm.per')}
            value={unit}
            onChange={setUnit}
            options={UNITS.map((u) => ({ value: u, label: t(`vendorCard.units.${u}`) }))}
          />
        </View>
        <TextField
          label={t('chat.quoteForm.guests')}
          value={guests}
          onChangeText={setGuests}
          maxLength={40}
        />
        <TextField
          label={t('chat.quoteForm.note')}
          hint={t('chat.quoteForm.noteHint')}
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={500}
        />
        {send.isError && <FieldError message={t(`chat.errors.${sendErrorKind(send.error)}`)} />}
        <Button label={t('chat.quoteForm.send')} loading={send.isPending} onPress={submit} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  field: {
    gap: Spacing.sm,
  },
});
