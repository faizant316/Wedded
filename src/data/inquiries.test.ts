import { followUpDue } from './inquiries';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/features/auth/session', () => ({ useSession: () => ({ session: null }) }));

const now = new Date('2026-10-10T12:00:00Z').getTime();
const sent = (daysAgo: number) => new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

describe('followUpDue', () => {
  it('asks two days after sending', () => {
    expect(followUpDue({ status: 'sent', sent_at: sent(2), reply_answer: null }, now)).toBe(true);
    expect(followUpDue({ status: 'sent', sent_at: sent(1.9), reply_answer: null }, now)).toBe(
      false,
    );
  });

  it('stops asking once answered', () => {
    expect(followUpDue({ status: 'sent', sent_at: sent(5), reply_answer: 'no_reply' }, now)).toBe(
      false,
    );
  });

  it('never asks about an inquiry that did not send', () => {
    expect(followUpDue({ status: 'failed', sent_at: null, reply_answer: null }, now)).toBe(false);
    expect(followUpDue({ status: 'queued', sent_at: null, reply_answer: null }, now)).toBe(false);
  });
});
