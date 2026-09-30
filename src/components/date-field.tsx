import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { Platform, View } from 'react-native';

import { Button } from '@/components/button';
import { makeStyles, Radius, Spacing, useColors, useScheme } from '@/constants/theme';
import { formatDate, fromDateString, toDateString } from '@/features/inquiry/inquiry-helpers';
import { useLocale } from '@/i18n/locale-context';

export type DateFieldProps = {
  /** yyyy-mm-dd, or null when not picked yet. */
  value: string | null;
  onChange: (value: string) => void;
  /** Shown on the button before a date is picked. */
  placeholder: string;
};

/**
 * Picking a date: the phone's own date wheel (iOS) or calendar (Android)
 * under a button showing the date, and the browser's date box on the web,
 * where the phone picker isn't available.
 */
export function DateField({ value, onChange, placeholder }: DateFieldProps) {
  const Colors = useColors();
  const styles = useStyles();
  const scheme = useScheme();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return createElement('input', {
      type: 'date',
      value: value ?? '',
      min: toDateString(new Date()),
      'aria-label': placeholder,
      onChange: (event: { target: { value: string } }) => {
        if (event.target.value) onChange(event.target.value);
      },
      style: {
        minHeight: 52,
        padding: '0 16px',
        borderRadius: Radius.field,
        border: `1px solid ${Colors.borderInput}`,
        background: Colors.surface,
        color: Colors.text,
        fontFamily: 'Inter_400Regular, sans-serif',
        fontSize: 17,
        colorScheme: scheme,
      },
    });
  }

  return (
    <View style={styles.field}>
      <Button
        variant="secondary"
        icon="calendar-outline"
        label={value ? formatDate(value) : placeholder}
        onPress={() => setOpen((shown) => !shown)}
      />
      {open && (
        <DateTimePicker
          value={value ? fromDateString(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          themeVariant={scheme}
          onChange={(event, picked) => {
            if (Platform.OS !== 'ios') setOpen(false);
            if (event.type === 'set' && picked) onChange(toDateString(picked));
          }}
        />
      )}
      {open && Platform.OS === 'ios' && (
        <Button variant="text" label={t('location.done')} onPress={() => setOpen(false)} />
      )}
    </View>
  );
}

const useStyles = makeStyles(() => ({
  field: {
    gap: Spacing.sm,
  },
}));
