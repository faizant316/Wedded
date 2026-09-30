import type { LocalizedText } from '@/i18n/localized';

// The shapes Tab A's chat hooks return (useConversations, useConversation).
export type ChatRole = 'family' | 'vendor' | 'system';

export type ChatQuote = {
  amount: number;
  unit?: 'person' | 'plate' | 'event' | 'hour' | 'day';
  eventSlug?: string;
  date?: string;
  guests?: string;
  note?: string;
  validUntil?: string;
};

export type ChatBooking = {
  eventSlugs: string[];
  eventDate: string | null;
  guestBand: string | null;
  location: string | null;
  details: Record<string, string> | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: ChatRole;
  kind: 'text' | 'photo' | 'quote' | 'menu' | 'booking';
  body: string | null;
  photoUrl: string | null;
  quote: ChatQuote | null;
  booking?: ChatBooking | null;
  menuId: string | null;
  /** ISO time. */
  createdAt: string;
  /** When the other side read it, or null. */
  readAt: string | null;
};

export type Conversation = {
  id: string;
  vendor: { id: string; slug: string; name: LocalizedText; photoUrl: string | null };
  family: { firstName: string };
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
};
