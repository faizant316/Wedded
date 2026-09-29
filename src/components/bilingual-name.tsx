import { View } from 'react-native';

import { AppText } from '@/components/app-text';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * A name from the database in both scripts: the app language on top, the
 * other underneath in its own font. Just the one line until Punjabi exists.
 */
export function BilingualName({ name }: { name: LocalizedText }) {
  const { locale } = useLocale();
  const { primary, secondary } = bilingual(name, locale);

  return (
    <View>
      <AppText variant="heading" lang={primary.lang}>
        {primary.text}
      </AppText>
      {secondary && (
        <AppText color="text2" lang={secondary.lang}>
          {secondary.text}
        </AppText>
      )}
    </View>
  );
}
