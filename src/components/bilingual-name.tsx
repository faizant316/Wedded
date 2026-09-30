import { View } from 'react-native';

import { AppText, type AppTextProps } from '@/components/app-text';
import type { FontWeight } from '@/constants/theme';
import { bilingual, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

/**
 * A name from the database in both scripts: the app language on top, the
 * other underneath in its own font. Just the one line until Punjabi exists.
 */
export function BilingualName({
  name,
  variant = 'heading',
  weight,
}: {
  name: LocalizedText;
  /** The size of the top line; the other script sits under it at body size. */
  variant?: AppTextProps['variant'];
  weight?: FontWeight;
}) {
  const { locale } = useLocale();
  const { primary, secondary } = bilingual(name, locale);

  return (
    <View>
      <AppText variant={variant} weight={weight} lang={primary.lang}>
        {primary.text}
      </AppText>
      {secondary && (
        <AppText variant="label" weight={400} color="text2" lang={secondary.lang}>
          {secondary.text}
        </AppText>
      )}
    </View>
  );
}
