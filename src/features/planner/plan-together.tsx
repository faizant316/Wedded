import { useState } from 'react';
import { Alert, Platform, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';
import { FieldError } from '@/components/field-error';
import { Icon } from '@/components/icon';
import { makeStyles, Radius, Spacing, useColors } from '@/constants/theme';
import { useSession } from '@/features/auth/session';
import { usePlan } from '@/features/planner/plan';
import {
  shareInvite,
  useCreateInvite,
  useRemoveMember,
  useStartWedding,
  useWeddingMembers,
  type AccountWedding,
  type WeddingMember,
} from '@/data/wedding';
import { useLocale } from '@/i18n/locale-context';
import { successHaptic } from '@/lib/haptics';

/** Initials for a member's circle: "Asha Kaur" → "AK". */
export function initials(name: string | null): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase();
}

function confirm(title: string, body: string, action: string, onYes: () => void) {
  if (Platform.OS === 'web') {
    // Alert does nothing in a web browser
    if (globalThis.confirm(`${title}\n\n${body}`)) onYes();
    return;
  }
  Alert.alert(title, body, [
    { text: action, style: 'destructive', onPress: onYes },
    { style: 'cancel', text: '✕' },
  ]);
}

/**
 * "Plan together" on My Wedding (docs/RESEARCH_GROWTH.md #1): save the plan
 * to the account and invite family by a link (WhatsApp), or, once shared,
 * see who's planning and invite more. Viewers see the plan but can't change it.
 */
export function PlanTogether({ wedding }: { wedding: AccountWedding | null }) {
  if (!wedding) return <StartTogether />;
  return <Together wedding={wedding} />;
}

function StartTogether() {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const { status, requireSignIn } = useSession();
  const phonePlan = usePlan();
  const start = useStartWedding();
  const createInvite = useCreateInvite();
  const [error, setError] = useState<string>();

  const begin = () => {
    setError(undefined);
    start.mutate(phonePlan, {
      onSuccess: (weddingId) => {
        successHaptic();
        // Straight to the share sheet, since inviting family is why they tapped
        createInvite.mutate(
          { weddingId, role: 'planner' },
          { onSuccess: (link) => void shareInvite(link, t) },
        );
      },
      onError: () => setError(t('planTogether.failed')),
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Icon name="people-outline" size={28} color={Colors.primary} />
        <AppText variant="heading" weight={700} style={styles.grow}>
          {t('planTogether.title')}
        </AppText>
      </View>
      <AppText color="text2">{t('planTogether.body')}</AppText>
      <Button
        icon="share-outline"
        label={status === 'signedIn' ? t('planTogether.start') : t('planTogether.signInToStart')}
        loading={start.isPending || createInvite.isPending}
        onPress={() => requireSignIn(begin)}
      />
      {error && <FieldError message={error} />}
    </View>
  );
}

function Together({ wedding }: { wedding: AccountWedding }) {
  const Colors = useColors();
  const styles = useStyles();
  const { t } = useLocale();
  const members = useWeddingMembers(wedding.id);
  const createInvite = useCreateInvite();
  const remove = useRemoveMember();
  const [note, setNote] = useState<string>();
  const [error, setError] = useState<string>();
  const canInvite = wedding.role !== 'viewer';
  const me = members.data?.find((m) => m.isMe);

  const invite = (role: 'planner' | 'viewer') => {
    setError(undefined);
    setNote(undefined);
    createInvite.mutate(
      { weddingId: wedding.id, role },
      {
        onSuccess: async (link) => {
          const result = await shareInvite(link, t);
          if (result === 'copied') setNote(t('planTogether.copied'));
        },
        onError: () => setError(t('planTogether.inviteFailed')),
      },
    );
  };

  const removeMember = (member: WeddingMember) => {
    const leaving = member.isMe;
    confirm(
      leaving
        ? t('planTogether.leaveTitle')
        : t('planTogether.removeTitle', { name: member.name ?? '' }),
      leaving ? t('planTogether.leaveBody') : t('planTogether.removeBody'),
      leaving ? t('planTogether.leave') : t('planTogether.remove'),
      () =>
        remove.mutate(
          { weddingId: wedding.id, userId: member.userId },
          { onError: () => setError(t('planTogether.failed')) },
        ),
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Icon name="people" size={28} color={Colors.primary} />
        <AppText variant="heading" weight={700} style={styles.grow}>
          {t('planTogether.sharedTitle')}
        </AppText>
      </View>
      {wedding.role === 'viewer' && <AppText color="text2">{t('planTogether.viewerNote')}</AppText>}

      <View style={styles.members}>
        {members.data?.map((member) => (
          <View key={member.userId} style={styles.member}>
            <View style={[styles.avatar, member.isMe && styles.avatarMe]}>
              <AppText weight={700} color={member.isMe ? 'onPrimary' : 'primary'}>
                {initials(member.name)}
              </AppText>
            </View>
            <View style={styles.grow}>
              <AppText weight={600}>
                {member.isMe ? t('planTogether.you') : (member.name ?? t('planTogether.someone'))}
              </AppText>
              <AppText variant="label" weight={400} color="text2">
                {t(`planTogether.roles.${member.role}`)}
              </AppText>
            </View>
            {(member.isMe || me?.role === 'owner') && (
              <Button
                variant="text"
                label={member.isMe ? t('planTogether.leave') : t('planTogether.remove')}
                onPress={() => removeMember(member)}
              />
            )}
          </View>
        ))}
      </View>

      {canInvite && (
        <>
          <Button
            icon="person-add-outline"
            label={t('planTogether.invite')}
            loading={createInvite.isPending && createInvite.variables?.role === 'planner'}
            onPress={() => invite('planner')}
          />
          <Button
            variant="text"
            label={t('planTogether.inviteViewer')}
            loading={createInvite.isPending && createInvite.variables?.role === 'viewer'}
            onPress={() => invite('viewer')}
          />
          <AppText variant="label" weight={400} color="text2">
            {t('planTogether.inviteHint')}
          </AppText>
        </>
      )}
      {note && <AppText color="success">{note}</AppText>}
      {error && <FieldError message={error} />}
    </View>
  );
}

const useStyles = makeStyles((Colors) => ({
  card: {
    gap: Spacing.md,
    padding: Spacing.xl,
    borderRadius: Radius.card,
    borderCurve: 'continuous',
    backgroundColor: Colors.surface,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  grow: {
    flex: 1,
  },
  members: {
    gap: Spacing.sm,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 52,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryTint,
  },
  avatarMe: {
    backgroundColor: Colors.primaryFill,
  },
}));
