// The inquiry email and how it's sent.
//
// Who it goes to (vision §8, S11):
// - to the vendor, with reply-to set to the family and a copy to the family;
//   founders get a blind copy
// - relay: the vendor doesn't use email, so it goes to the founders, who
//   forward it by WhatsApp or text
// - test inbox: while there's no verified sending domain (Phase 5), set
//   INQUIRY_TEST_INBOX and every vendor email goes there instead
//
// How it's sent: Resend when RESEND_API_KEY is set (production), otherwise
// the local Mailpit when MAILPIT_URL is set (npm run db:start).

import type { Contact, GuestBand, InquiryInput } from './validate.ts';

export type OutgoingEmail = {
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  replyTo: string[];
  subject: string;
  text: string;
  html: string;
};

const GUEST_LABELS: Record<GuestBand, string> = {
  under_50: 'Under 50',
  '50_100': '50 to 100',
  '100_250': '100 to 250',
  '250_500': '250 to 500',
  '500_plus': '500 or more',
  not_sure: 'Not sure yet',
};

const CONTACT_LABELS: Record<Contact, string> = {
  call: 'Call',
  text: 'Text',
  whatsapp: 'WhatsApp',
  email: 'Email',
};

function env(name: string): string | undefined {
  const value = Deno.env.get(name)?.trim();
  return value ? value : undefined;
}

function list(name: string): string[] {
  return (env(name) ?? '')
    .split(',')
    .map((address) => address.trim())
    .filter(Boolean);
}

/** "2027-06-13" as "Sat, Jun 13, 2027" (a calendar date, so no time zone shift). */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

/** "19:30" as "7:30 PM". */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours < 12 ? 'AM' : 'PM';
  return `${hours % 12 === 0 ? 12 : hours % 12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function formatPhone(e164: string): string {
  const us = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return us ? `(${us[1]}) ${us[2]}-${us[3]}` : e164;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export type InquiryEmailInput = {
  inquiryId: string;
  channel: 'email' | 'relay';
  vendorName: string;
  vendorEmail: string | null;
  vendorPhone: string | null;
  eventNames: string[];
  inquiry: InquiryInput;
  sender: { name: string; phone: string; email: string | null; city: string };
};

export function buildInquiryEmail(input: InquiryEmailInput): OutgoingEmail {
  const { inquiry, sender } = input;
  const founders = list('FOUNDERS_EMAIL');
  const testInbox = env('INQUIRY_TEST_INBOX');

  let to: string[];
  if (input.channel === 'relay') {
    to = testInbox ? [testInbox] : founders;
  } else {
    to = testInbox ? [testInbox] : input.vendorEmail ? [input.vendorEmail] : [];
  }
  if (to.length === 0) {
    throw new Error(
      input.channel === 'relay'
        ? 'Relay inquiry but FOUNDERS_EMAIL is not set'
        : 'Vendor has no email address',
    );
  }

  // Replies to Apple's private relay addresses bounce, so vendors reply by phone instead
  const replyable = sender.email && !sender.email.endsWith('@privaterelay.appleid.com');

  const events = input.eventNames.length > 0 ? input.eventNames.join(', ') : 'Not sure yet';
  const date = inquiry.eventDate ? formatDate(inquiry.eventDate) : 'Date not fixed yet';
  const time = inquiry.startTime ? ` (around ${formatTime(inquiry.startTime)})` : '';
  const guests = GUEST_LABELS[inquiry.guestBand];
  const firstName = sender.name.split(' ')[0];
  const subjectEvents = input.eventNames.length > 0 ? input.eventNames.join(' + ') : 'Wedding';

  let subject = `Inquiry: ${subjectEvents}, ${
    inquiry.eventDate ? formatDate(inquiry.eventDate) : 'date not fixed'
  }, ${guests.toLowerCase()} guests, from ${firstName} (${sender.city})`;
  if (input.channel === 'relay') subject = `[Forward to ${input.vendorName}] ${subject}`;

  const notes: string[] = [];
  if (testInbox && input.channel === 'email') {
    notes.push(
      `TEST MODE: in production this goes to ${input.vendorName} at ${input.vendorEmail}.`,
    );
  }
  if (input.channel === 'relay') {
    notes.push(
      `${input.vendorName} doesn't use email. Please forward this by WhatsApp or text` +
        (input.vendorPhone ? ` to ${formatPhone(input.vendorPhone)}.` : '.'),
    );
  }

  const rows: [string, string][] = [
    ['Events', events],
    ['Date', `${date}${time}`],
    ['Guests', guests],
    ['Where', inquiry.location],
    ['Best way to reply', CONTACT_LABELS[inquiry.preferredContact]],
    ['Phone', formatPhone(sender.phone)],
  ];
  if (sender.email) rows.push(['Email', sender.email]);

  const text = [
    ...notes,
    ...(notes.length > 0 ? [''] : []),
    `New inquiry for ${input.vendorName} from ${sender.name} (${sender.city}).`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    inquiry.message,
    '',
    replyable
      ? `Reply to this email, or contact ${firstName} directly by ${
        CONTACT_LABELS[inquiry.preferredContact].toLowerCase()
      }.`
      : `Please contact ${firstName} by phone: ${formatPhone(sender.phone)}.`,
    '',
    '--',
    `Sent through Wedding Vendor App. Families contact you directly; we never charge for introductions. Reference: ${input.inquiryId}`,
  ].join('\n');

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fdf8f0;font-family:Arial,Helvetica,sans-serif;color:#2b1a12;">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;">
${
    notes.map((note) =>
      `<p style="margin:0 0 12px;padding:10px 12px;background:#fdecc8;border-radius:8px;font-size:15px;">${
        escapeHtml(note)
      }</p>`
    ).join('\n')
  }
<h1 style="font-size:20px;margin:0 0 16px;">New inquiry for ${escapeHtml(input.vendorName)} from ${
    escapeHtml(sender.name)
  } (${escapeHtml(sender.city)})</h1>
<table style="border-collapse:collapse;font-size:16px;margin:0 0 16px;">
${
    rows.map(([label, value]) =>
      `<tr><td style="padding:4px 16px 4px 0;color:#5c4a40;">${
        escapeHtml(label)
      }</td><td style="padding:4px 0;font-weight:bold;">${escapeHtml(value)}</td></tr>`
    ).join('\n')
  }
</table>
<p style="font-size:16px;line-height:1.5;margin:0 0 16px;white-space:pre-wrap;">${
    escapeHtml(inquiry.message)
  }</p>
<p style="font-size:14px;color:#5c4a40;margin:0;">Sent through Wedding Vendor App. Families contact you directly; we never charge for introductions. Reference: ${
    escapeHtml(input.inquiryId)
  }</p>
</div></body></html>`;

  return {
    from: env('INQUIRY_FROM') ?? 'Wedding Vendor App <inquiries@example.com>',
    to,
    cc: sender.email ? [sender.email] : [],
    bcc: founders.filter((address) => !to.includes(address)),
    replyTo: replyable && sender.email ? [sender.email] : [],
    subject,
    text,
    html,
  };
}

/** "Name <email@example.com>" as its parts. */
function splitAddress(address: string): { Email: string; Name?: string } {
  const match = /^(.*)<([^>]+)>\s*$/.exec(address);
  return match ? { Name: match[1].trim(), Email: match[2].trim() } : { Email: address.trim() };
}

/** Sends the email and returns the provider's message id. `idempotencyKey` is the inquiry id. */
export async function sendEmail(email: OutgoingEmail, idempotencyKey: string): Promise<string> {
  const resendKey = env('RESEND_API_KEY');
  if (resendKey) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: email.from,
        to: email.to,
        cc: email.cc.length > 0 ? email.cc : undefined,
        bcc: email.bcc.length > 0 ? email.bcc : undefined,
        reply_to: email.replyTo.length > 0 ? email.replyTo : undefined,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.id !== 'string') {
      throw new Error(`Resend ${response.status}: ${JSON.stringify(result).slice(0, 300)}`);
    }
    return result.id;
  }

  const mailpit = env('MAILPIT_URL');
  if (mailpit) {
    const response = await fetch(`${mailpit}/api/v1/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: splitAddress(email.from),
        To: email.to.map((address) => ({ Email: address })),
        Cc: email.cc.map((address) => ({ Email: address })),
        Bcc: email.bcc,
        ReplyTo: email.replyTo.map((address) => ({ Email: address })),
        Subject: email.subject,
        Text: email.text,
        HTML: email.html,
        Headers: { 'X-Inquiry-Id': idempotencyKey },
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || typeof result.ID !== 'string') {
      throw new Error(`Mailpit ${response.status}: ${JSON.stringify(result).slice(0, 300)}`);
    }
    return result.ID;
  }

  throw new Error('No email provider: set RESEND_API_KEY (or MAILPIT_URL locally)');
}
