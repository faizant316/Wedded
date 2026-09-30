import type { Conversation } from '@/data/chat';

type Translate = (key: string, options?: Record<string, string | number>) => string;

/** A conversation's last message as one line for the inbox. */
export function lastMessagePreview(conversation: Conversation, t: Translate): string {
  const last = conversation.lastMessage;
  if (!last) return t('chat.noMessages');
  const mine = last.senderRole === conversation.side;
  let text: string;
  switch (last.kind) {
    case 'photo':
      text = t('chat.preview.photo');
      break;
    case 'quote':
      text = t('chat.preview.quote');
      break;
    case 'menu':
      text = t('chat.preview.menu');
      break;
    case 'booking':
      text = t('chat.preview.booking');
      break;
    default:
      text = (last.body ?? '').replace(/\s+/g, ' ').trim();
  }
  return mine ? t('chat.preview.you', { text }) : text;
}

/** "2:05 PM" today, "Yesterday", or "Sep 12" for older ones. */
export function inboxTime(iso: string, t: Translate, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, now)) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
  }
  if (sameDay(d, new Date(now.getTime() - 24 * 60 * 60 * 1000))) return t('chat.yesterday');
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}
