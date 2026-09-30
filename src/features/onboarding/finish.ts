import { useAreaCodes } from '@/data/places';
import { useTraditions } from '@/data/reference';
import { useStartWedding, useWeddingPlan } from '@/data/wedding';
import { useSession } from '@/features/auth/session';
import { useSearchLocation } from '@/features/location/search-location';
import { getPlan, traditionsFor } from '@/features/planner/plan';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';

import { getAnswers } from './answers';
import { markOnboarding } from './onboarding-state';

/**
 * Turns the first questions into the family's plan: their traditions (from
 * background and faith, which are then forgotten), the date, the events and
 * where to search. Signed in, the plan is saved to
 * their account straight away (Plan together), with who it's for.
 */
export function useFinishOnboarding() {
  const wedding = useWeddingPlan();
  const traditions = useTraditions();
  const areaCodes = useAreaCodes();
  const { setPlace } = useSearchLocation();
  const { status } = useSession();
  const startWedding = useStartWedding();
  const { locale } = useLocale();

  return () => {
    const answers = getAnswers();
    const picked = traditionsFor(answers.backgrounds, answers.faiths, traditions.data ?? []);
    const events = answers.events ?? [];

    wedding.setTraditions(picked.map((tradition) => tradition.slug));
    if (answers.weddingDate) wedding.setWeddingDate(answers.weddingDate);
    if (events.length > 0) wedding.addEvents(events);

    const area = areaCodes.data?.find((a) => a.code === answers.areaCode);
    if (area) {
      setPlace(
        {
          label: localized(area.label, locale),
          latitude: area.latitude,
          longitude: area.longitude,
        },
        area.radiusMiles,
      );
    }

    if (status === 'signedIn' && !wedding.wedding) {
      startWedding.mutate({ ...getPlan(), planningFor: answers.planningFor });
    }
    markOnboarding('done');
  };
}
