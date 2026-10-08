import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/app-text';
import { BackButton } from '@/components/back-button';
import { BookingCard } from '@/components/chat/booking-card';
import { Composer } from '@/components/chat/composer';
import { DaySeparator } from '@/components/chat/day-separator';
import { MessageRow, PhotoBubble, TextBubble } from '@/components/chat/message-row';
import { PhoneCard } from '@/components/chat/phone-card';
import { QuoteCard } from '@/components/chat/quote-card';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { Chip } from '@/components/chip';
import { FieldError } from '@/components/field-error';
import { MenuCard } from '@/components/menu-card';
import { Screen } from '@/components/screen';
import { StateView } from '@/components/state-view';
import { makeStyles, Sizes, Spacing } from '@/constants/theme';
import {
  sendErrorKind,
  useChatPhotoUrl,
  useConversation,
  useSendMessage,
  type Conversation,
  type Message,
} from '@/data/chat';
import { useTyping } from '@/data/chat-typing';
import { useHomeEvents } from '@/data/reference';
import { useVendorMenus } from '@/data/vendor-menus';
import { sentPhotoUri } from '@/features/chat/chat-photo';
import { layoutThread, type ThreadItem } from '@/features/chat/thread-layout';
import { type PhotoUpload, usePhotoSender } from '@/features/chat/use-photo-sender';
import { useSession } from '@/features/auth/session';
import { usd } from '@/features/vendors/profile-format';
import { localized } from '@/i18n/localized';
import { useLocale } from '@/i18n/locale-context';
import { formatPhone } from '@/lib/phone';

const QUICK_REPLIES = ['available', 'price', 'visit', 'thanks'] as const;

/**
 * One conversation between a family and a vendor, live. The family's inquiry
 * is the first card; then bubbles, photos, quotes and menus, grouped by day.
 * Either side can send a photo, and sees "… is typing" while the other side
 * writes. Families get quick replies and "Share my number" (their number never
 * reaches the vendor otherwise, C2); vendors get "Send a quote" and "Send a
 * menu", and only ever reply.
 * Opening it marks it read. /chat/{conversation id}
 */
export default function ChatScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t, locale } = useLocale();
  const thread = useConversation(id);
  const send = useSendMessage(id);
  const photos = usePhotoSender(id, send);
  const [draft, setDraft] = useState('');
  const convo = thread.conversation;
  const side = convo?.side ?? 'family';
  const typing = useTyping(id, convo?.side ?? null);
  const { profile } = useSession();
  const sharedNumber = thread.messages.some((m) => m.kind === 'phone' && m.senderRole === 'family');

  // Asked first, with the number shown, since it can't be taken back
  const shareNumber = () => {
    if (!profile?.phone) return;
    const number = formatPhone(profile.phone);
    const share = () => send.mutate({ kind: 'phone' });
    if (Platform.OS === 'web') {
      if (globalThis.confirm(t('chat.phone.confirm', { number }))) share();
      return;
    }
    Alert.alert(t('chat.phone.confirmTitle'), t('chat.phone.confirm', { number }), [
      { text: t('chat.phone.cancel'), style: 'cancel' },
      { text: t('chat.phone.share'), onPress: share },
    ]);
  };

  const sendText = (text: string) => {
    const body = text.trim();
    if (!body) return;
    typing.stopped();
    send.mutate({ kind: 'text', body });
    setDraft('');
  };

  const changeDraft = (text: string) => {
    setDraft(text);
    if (text.trim()) typing.typed();
    else typing.stopped();
  };

  // Newest at the bottom: an inverted list takes the rows newest first,
  // with photos still on their way below everything else.
  const items: Row[] = [
    ...photos.uploads
      .map((upload) => ({ type: 'upload' as const, key: upload.id, upload }))
      .reverse(),
    ...layoutThread(thread.messages, side).reverse(),
  ];
  const familyTexts = thread.messages.filter(
    (m) => m.senderRole === 'family' && m.kind === 'text',
  ).length;

  let error: string | null = photos.notice;
  if (send.isError) error = t(`chat.errors.${sendErrorKind(send.error)}`);

  const title = convo
    ? side === 'vendor'
      ? (convo.family.firstName ?? t('chat.aFamily'))
      : localized(convo.vendor.name, locale)
    : '';

  return (
    <Screen edges={['top']}>
      <View style={styles.bar}>
        <BackButton />
        {convo && (
          <Pressable
            accessibilityRole={side === 'family' ? 'link' : 'header'}
            accessibilityLabel={side === 'family' ? t('chat.openProfile', { name: title }) : title}
            disabled={side !== 'family'}
            onPress={() =>
              router.push({ pathname: '/v/[slug]', params: { slug: convo.vendor.slug } })
            }
            style={({ pressed }) => [styles.titleWrap, pressed && styles.pressed]}
          >
            <AppText variant="heading" weight={700} numberOfLines={1}>
              {title}
            </AppText>
            <AppText
              variant="caption"
              color={side === 'family' ? 'primary' : 'text2'}
              numberOfLines={1}
            >
              {side === 'family'
                ? t('chat.viewProfile')
                : t('chat.forBusiness', { name: localized(convo.vendor.name, locale) })}
            </AppText>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {thread.isPending ? (
          <StateView state="loading" />
        ) : thread.isError ? (
          <StateView state="error" onRetry={() => void thread.refetch()} />
        ) : (
          <FlatList
            inverted
            data={items}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) =>
              item.type === 'upload' ? (
                <UploadRow
                  upload={item.upload}
                  onRetry={() => photos.retry(item.upload)}
                  onRemove={() => photos.remove(item.upload.id)}
                />
              ) : (
                <ThreadRow item={item} conversation={convo} onReply={setDraft} onSend={sendText} />
              )
            }
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListFooterComponent={<View style={styles.top} />}
            // Inverted, the header sits at the bottom, under the newest message
            ListHeaderComponent={
              typing.otherTyping && title ? (
                <TypingIndicator label={t('chat.typing', { name: title })} />
              ) : null
            }
          />
        )}

        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
          {error && (
            <View style={styles.error}>
              <FieldError message={error} />
            </View>
          )}
          {side === 'vendor' && convo && (
            <View style={styles.tools}>
              <Chip
                role="button"
                label={t('chat.sendQuote')}
                onPress={() => router.push({ pathname: '/chat-quote', params: { id } })}
              />
              <Chip
                role="button"
                label={t('chat.sendMenu')}
                onPress={() =>
                  router.push({ pathname: '/chat-menu', params: { id, vendorId: convo.vendor.id } })
                }
              />
            </View>
          )}
          {side === 'family' && convo && profile?.phone && !sharedNumber && (
            <View style={styles.tools}>
              <Chip role="button" label={t('chat.phone.shareButton')} onPress={shareNumber} />
            </View>
          )}
          <Composer
            value={draft}
            onChangeText={changeDraft}
            onBlur={typing.stopped}
            onSend={() => sendText(draft)}
            onAddPhoto={convo ? photos.pick : undefined}
            sending={send.isPending}
            quickReplies={
              side === 'family' && familyTexts < 2
                ? QUICK_REPLIES.map((key) => t(`chat.quickReplies.${key}`))
                : undefined
            }
            onQuickReply={sendText}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

type Row = ThreadItem | { type: 'upload'; key: string; upload: PhotoUpload };

/** A photo of mine still on its way: "Sending…", or what went wrong and what to do. */
function UploadRow({
  upload,
  onRetry,
  onRemove,
}: {
  upload: PhotoUpload;
  onRetry: () => void;
  onRemove: () => void;
}) {
  const styles = useStyles();
  const { t } = useLocale();
  const failed = upload.status === 'failed';
  return (
    <View style={styles.upload}>
      <View style={failed ? null : styles.pending}>
        <PhotoBubble url={upload.uri} label={t('chat.photo')} />
      </View>
      {failed ? (
        <>
          <AppText variant="caption" color="error" style={styles.uploadText}>
            {t('chat.photos.failed')}
          </AppText>
          <View style={styles.uploadActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onRetry}
              style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}
            >
              <AppText weight={700} color="primary">
                {t('chat.photos.tryAgain')}
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onRemove}
              style={({ pressed }) => [styles.uploadButton, pressed && styles.pressed]}
            >
              <AppText weight={700} color="text2">
                {t('chat.photos.remove')}
              </AppText>
            </Pressable>
          </View>
        </>
      ) : (
        <AppText variant="caption" color="text2" accessibilityLiveRegion="polite">
          {t('chat.photos.sending')}
        </AppText>
      )}
    </View>
  );
}

/** A day heading or one message, drawn by its kind. */
function ThreadRow({
  item,
  conversation,
  onReply,
  onSend,
}: {
  item: ThreadItem;
  conversation: Conversation | null;
  onReply: (text: string) => void;
  onSend: (text: string) => void;
}) {
  const styles = useStyles();
  if (item.type === 'day') return <DaySeparator day={item.day} />;
  const { message, mine, first, last, seen } = item;
  return (
    <View style={message.id.startsWith('pending-') ? styles.pending : null}>
      <MessageRow
        mine={mine}
        last={last}
        seen={seen}
        createdAt={message.createdAt}
        wide={
          message.kind === 'quote' ||
          message.kind === 'menu' ||
          message.kind === 'booking' ||
          message.kind === 'phone'
        }
      >
        <MessageContent
          message={message}
          mine={mine}
          first={first}
          last={last}
          conversation={conversation}
          onReply={onReply}
          onSend={onSend}
        />
      </MessageRow>
    </View>
  );
}

function MessageContent({
  message,
  mine,
  first,
  last,
  conversation,
  onReply,
  onSend,
}: {
  message: Message;
  mine: boolean;
  first: boolean;
  last: boolean;
  conversation: Conversation | null;
  onReply: (text: string) => void;
  onSend: (text: string) => void;
}) {
  const { t, locale } = useLocale();
  const events = useHomeEvents();
  const eventName = (slug: string) => {
    const event = (events.data ?? []).flatMap((s) => s.events).find((e) => e.slug === slug);
    return event ? localized(event.name, locale) : slug;
  };

  switch (message.kind) {
    case 'photo':
      return <ChatPhoto path={message.photoPath} label={t('chat.photo')} />;
    case 'quote':
      return message.quote ? (
        <QuoteCard
          quote={message.quote}
          eventName={message.quote.eventSlug ? eventName(message.quote.eventSlug) : null}
          onAccept={
            !mine && conversation?.side === 'family'
              ? () =>
                  onSend(
                    t('chat.quote.acceptMessage', {
                      amount: usd.format(message.quote?.amount ?? 0),
                    }),
                  )
              : undefined
          }
          onAsk={
            !mine && conversation?.side === 'family'
              ? () => onReply(t('chat.quote.askPrefix'))
              : undefined
          }
        />
      ) : null;
    case 'menu':
      return message.menuId && conversation ? (
        <ChatMenu vendorId={conversation.vendor.id} menuId={message.menuId} />
      ) : null;
    case 'booking':
      return message.booking ? (
        <BookingCard
          booking={message.booking}
          eventNames={message.booking.eventSlugs.map(eventName)}
          guestLabel={
            message.booking.guestBand ? t(`inquiry.guestBands.${message.booking.guestBand}`) : null
          }
        />
      ) : null;
    case 'phone':
      return message.phone ? <PhoneCard phone={message.phone} mine={mine} /> : null;
    default:
      return <TextBubble text={message.body ?? ''} mine={mine} first={first} last={last} />;
  }
}

function ChatPhoto({ path, label }: { path: string | null; label: string }) {
  const styles = useStyles();
  // A photo sent from this phone shows from the phone's copy at once
  const local = sentPhotoUri(path);
  const url = useChatPhotoUrl(local ? null : path);
  const uri = local ?? url.data;
  if (!uri) return <View style={styles.photoWait} accessibilityLabel={label} />;
  return <PhotoBubble url={uri} label={label} />;
}

function ChatMenu({ vendorId, menuId }: { vendorId: string; menuId: string }) {
  const menus = useVendorMenus(vendorId);
  const menu = menus.data?.find((m) => m.id === menuId);
  if (!menu) return null;
  return (
    <MenuCard
      menu={menu}
      onPress={() => router.push({ pathname: '/menu', params: { vendorId, menuId } })}
    />
  );
}

const useStyles = makeStyles((Colors) => ({
  bar: {
    minHeight: Sizes.navBar + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  titleWrap: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  fill: {
    flex: 1,
    marginHorizontal: -Sizes.pageGutter,
  },
  list: {
    paddingHorizontal: Sizes.pageGutter,
    paddingTop: Spacing.md,
  },
  top: {
    height: Spacing.lg,
  },
  pending: {
    opacity: 0.6,
  },
  photoWait: {
    width: 240,
    height: 240,
    borderRadius: 18,
    backgroundColor: Colors.skeleton,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    backgroundColor: Colors.bg,
  },
  error: {
    paddingHorizontal: Sizes.pageGutter,
    paddingTop: Spacing.sm,
  },
  upload: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '82%',
    gap: 3,
    marginTop: Spacing.sm,
  },
  uploadText: {
    textAlign: 'right',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  uploadButton: {
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Sizes.pageGutter,
    paddingTop: Spacing.sm,
  },
}));
