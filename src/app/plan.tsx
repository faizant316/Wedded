import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { BilingualName } from '@/components/bilingual-name';
import { Chip } from '@/components/chip';
import { DateField } from '@/components/date-field';
import { groupIcon } from '@/components/group-icon';
import { Icon } from '@/components/icon';
import { SectionTitle } from '@/components/list';
import { NavScreen } from '@/components/nav';
import { StateView } from '@/components/state-view';
import { makeStyles, Radius, Sizes, Spacing, useColors } from '@/constants/theme';
import { useEventNeeds, useHomeEvents } from '@/data/reference';
import { useWeddingPlan } from '@/data/wedding';
import { formatDate, GUEST_BANDS } from '@/features/inquiry/inquiry-helpers';
import { bookedCount, daysUntil } from '@/features/planner/plan';
import { PlanTogether } from '@/features/planner/plan-together';
import { bilingual, localized, type LocalizedText } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { selectionHaptic, successHaptic } from '@/lib/haptics';

/**
 * My Wedding: the countdown to the Anand Karaj, the events the family is
 * having, and for each a checklist of the vendors it needs (essential first)
 * to tick off as they're booked, with a shortcut to find each one. Saved on
 * this phone, or to the account and shared with family (Plan together,
 * src/data/wedding.ts); viewers see the plan but can't change it.
 */
export default function PlanScreen() {
  const Colors = useColors();
  const styles = useStyles();
  const { t, locale } = useLocale();
  const {
    plan,
    wedding,
    canEdit,
    saveFailed,
    setWeddingDate,
    toggleEvent,
    toggleBooked,
    setEventGuests,
  } = useWeddingPlan();
  const events = useHomeEvents();
  const allEvents = events.data?.flatMap((section) => section.events) ?? [];
  const chosen = allEvents.filter((event) => plan.events.includes(event.slug));
  const days = plan.weddingDate ? daysUntil(plan.weddingDate) : null;
  const booked = bookedCount(plan);

  return (
    <NavScreen title={t('planner.title')} subtitle={t('planner.subtitle')}>
      <View style={styles.hero}>
        {days !== null && plan.weddingDate ? (
          <>
            <AppText variant="label" weight={600} color="text2">
              {days >= 0 ? t('planner.countdownLabel') : t('planner.married')}
            </AppText>
            {days >= 0 && (
              <View style={styles.countRow}>
                <AppText variant="display" weight={800} color="primary" style={styles.count}>
                  {String(days)}
                </AppText>
                <AppText variant="heading" color="text2">
                  {t('planner.days', { count: days })}
                </AppText>
              </View>
            )}
            <AppText variant="bodyLg" weight={600}>
              {formatDate(plan.weddingDate)}
            </AppText>
          </>
        ) : (
          <>
            <Icon name="calendar-outline" size={36} color={Colors.primary} />
            <AppText variant="heading" weight={700}>
              {t('planner.whenTitle')}
            </AppText>
            <AppText color="text2">{t('planner.whenBody')}</AppText>
          </>
        )}
        {canEdit && (
          <DateField
            value={plan.weddingDate}
            onChange={(date) => {
              successHaptic();
              setWeddingDate(date);
            }}
            placeholder={plan.weddingDate ? t('planner.changeDate') : t('planner.pickDate')}
          />
        )}
        {chosen.length > 0 && (
          <View style={styles.summary}>
            <Stat value={booked} label={t('planner.bookedStat', { count: booked })} />
            <Stat value={chosen.length} label={t('planner.eventsStat', { count: chosen.length })} />
          </View>
        )}
      </View>

      <PlanTogether wedding={wedding} />
      {saveFailed && (
        <AppText color="error" style={styles.pad}>
          {t('planTogether.saveFailed')}
        </AppText>
      )}

      <View style={styles.block}>
        <SectionTitle>{t('planner.eventsTitle')}</SectionTitle>
        <AppText color="text2" style={styles.pad}>
          {t('planner.eventsHint')}
        </AppText>
        {events.isPending && <StateView state="loading" />}
        {events.isError && <StateView state="error" onRetry={() => void events.refetch()} />}
        <View style={styles.chips}>
          {allEvents.map((event) => (
            <Chip
              key={event.slug}
              label={localized(event.name, locale)}
              selected={plan.events.includes(event.slug)}
              disabled={!canEdit}
              onPress={() => toggleEvent(event.slug)}
            />
          ))}
        </View>
      </View>

      {chosen.length > 0 && (
        <View style={styles.block}>
          <SectionTitle>{t('planner.checklistTitle')}</SectionTitle>
          {chosen.map((event, i) => (
            <EventPlan
              key={event.slug}
              slug={event.slug}
              name={event.name}
              booked={plan.booked[event.slug] ?? []}
              startOpen={i === 0}
              canEdit={canEdit}
              onToggleBooked={(category) => toggleBooked(event.slug, category)}
              guests={plan.guests?.[event.slug] ?? null}
              onGuests={(band) => setEventGuests(event.slug, band)}
            />
          ))}
        </View>
      )}
    </NavScreen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const styles = useStyles();
  return (
    <View style={styles.stat}>
      <AppText variant="title" style={styles.tabular}>
        {String(value)}
      </AppText>
      <AppText variant="label" weight={400} color="text2">
        {label}
      </AppText>
    </View>
  );
}

/** One event's checklist, folded away until opened. */
function EventPlan({
  slug,
  name,
  booked,
  startOpen,
  canEdit,
  onToggleBooked,
  guests,
  onGuests,
}: {
  slug: string;
  name: LocalizedText;
  booked: string[];
  startOpen: boolean;
  canEdit: boolean;
  onToggleBooked: (categorySlug: string) => void;
  guests: string | null;
  onGuests: (band: string | null) => void;
}) {
  const Colors = useColors();
  const styles = useStyles();
  const { t, locale } = useLocale();
  const needs = useEventNeeds(slug);
  const [open, setOpen] = useState(startOpen);
  const all = needs.data?.flatMap((section) => section.needs) ?? [];
  const done = all.filter((need) => booked.includes(need.categorySlug)).length;
  const share = all.length > 0 ? done / all.length : 0;
  const { primary } = bilingual(name, locale);

  return (
    <View style={styles.eventCard}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${primary.text}, ${t('planner.progress', { done, total: all.length })}`}
        onPress={() => setOpen((shown) => !shown)}
        style={({ pressed }) => [styles.eventHead, pressed && styles.pressed]}
      >
        <View style={styles.grow}>
          <BilingualName name={name} variant="bodyLg" weight={600} />
          <AppText variant="label" weight={400} color="text2">
            {t('planner.progress', { done, total: all.length })}
          </AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${share * 100}%` }]} />
          </View>
        </View>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.chevron}
          weight="semibold"
        />
      </Pressable>
      {open && (
        <View style={styles.guests}>
          <AppText variant="label" weight={600} color="text2">
            {t('planner.guestsTitle')}
          </AppText>
          <View style={styles.guestChips} accessibilityRole="radiogroup">
            {GUEST_BANDS.map((band) => (
              <Chip
                key={band}
                role="radio"
                label={t(`inquiry.guestBands.${band}`)}
                selected={guests === band}
                disabled={!canEdit}
                onPress={() => onGuests(guests === band ? null : band)}
              />
            ))}
          </View>
        </View>
      )}
      {open &&
        needs.data?.map((section) =>
          section.needs.map((need) => {
            const isBooked = booked.includes(need.categorySlug);
            const needName = localized(need.name, locale);
            return (
              <View key={need.categorySlug} style={styles.need}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isBooked, disabled: !canEdit }}
                  accessibilityLabel={t('planner.markBooked', { name: needName })}
                  disabled={!canEdit}
                  onPress={() => {
                    if (isBooked) selectionHaptic();
                    else successHaptic();
                    onToggleBooked(need.categorySlug);
                  }}
                  hitSlop={8}
                  style={[styles.check, isBooked && styles.checkOn]}
                >
                  {isBooked && (
                    <Icon name="checkmark" size={16} color={Colors.onPrimary} weight="bold" />
                  )}
                </Pressable>
                <Icon name={groupIcon(need.groupSlug)} size={20} color={Colors.primary} />
                <View style={styles.grow}>
                  <AppText style={isBooked ? styles.doneText : undefined}>{needName}</AppText>
                  {section.importance === 'essential' && !isBooked && (
                    <AppText variant="caption" color="kesari" weight={600}>
                      {t('event.essential')}
                    </AppText>
                  )}
                </View>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={t('planner.find', { name: needName })}
                  onPress={() =>
                    router.push({
                      pathname: '/c/[category]',
                      params: { category: need.categorySlug, event: slug },
                    })
                  }
                  style={({ pressed }) => [styles.find, pressed && styles.pressed]}
                >
                  <AppText variant="label" weight={600} color="primary">
                    {t('planner.findShort')}
                  </AppText>
                </Pressable>
              </View>
            );
          }),
        )}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  hero: {
    gap: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
  },
  count: {
    fontSize: 64,
    lineHeight: 72,
    fontVariant: ['tabular-nums'],
  },
  summary: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  stat: {
    gap: 0,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  block: {
    gap: Spacing.lg,
  },
  pad: {
    paddingHorizontal: Spacing.xs,
    marginTop: -Spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  eventCard: {
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  eventHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  pressed: {
    opacity: 0.6,
  },
  grow: {
    flex: 1,
    gap: 2,
  },
  progressTrack: {
    height: 6,
    marginTop: Spacing.sm,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Colors.fill,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  need: {
    minHeight: Sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    borderColor: Colors.primaryFill,
    backgroundColor: Colors.primaryFill,
  },
  doneText: {
    color: Colors.text2,
    textDecorationLine: 'line-through',
  },
  guests: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  guestChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  find: {
    minHeight: Sizes.tapTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
}));
