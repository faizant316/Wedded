/** What the person typed, exactly as typed. */
export type AboutYouDraft = {
  name: string;
  city: string;
  phone: string;
  email: string;
  isAdult: boolean;
};

/** Cleaned-up values, ready to save. */
export type AboutYouValues = {
  /** Trimmed, inner spaces collapsed. Any script. */
  name: string;
  /** Trimmed, inner spaces collapsed. */
  city: string;
  /** E.164, e.g. "+15305550101". A 10-digit number is taken as US/Canada. */
  phone: string;
  /** Trimmed and lowercased. */
  email: string;
  /** The form never submits unless the 18+ box is ticked. */
  isAdult: true;
};

export type AboutYouField = keyof AboutYouDraft;

/** i18n keys under `aboutYou.errors`. */
export type AboutYouErrorKey =
  | 'nameRequired'
  | 'cityRequired'
  | 'phoneRequired'
  | 'phoneInvalid'
  | 'emailRequired'
  | 'emailInvalid'
  | 'adultRequired';

export type AboutYouErrors = Partial<Record<AboutYouField, AboutYouErrorKey>>;

const GURMUKHI_DIGIT_ZERO = 0x0a66;

/** Gurmukhi digits (੦–੯) to 0–9, in case someone types or pastes them. */
export function toLatinDigits(text: string): string {
  return text.replace(/[੦-੯]/g, (digit) => String(digit.charCodeAt(0) - GURMUKHI_DIGIT_ZERO));
}

function collapseSpaces(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * A phone number in E.164, or null if it can't be one. Accepts any spacing or
 * punctuation. Without a leading +, it must be a US/Canada number (10 digits,
 * or 11 starting with 1); with a +, any 8 to 15 digits (e.g. an India number).
 */
export function normalizePhone(input: string): string | null {
  const text = toLatinDigits(input.trim());
  const digits = text.replace(/\D/g, '');

  if (text.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }

  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  // US/Canada area codes and exchanges never start with 0 or 1.
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? `+1${national}` : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** True for something shaped like name@example.com (already trimmed and lowercased). */
export function isValidEmail(email: string): boolean {
  return EMAIL.test(email);
}

/** Every field is required: the errors to show, or the cleaned values when there are none. */
export function validateAboutYou(draft: AboutYouDraft): {
  errors: AboutYouErrors;
  values: AboutYouValues | null;
} {
  const errors: AboutYouErrors = {};

  const name = collapseSpaces(draft.name);
  if (!name) errors.name = 'nameRequired';

  const city = collapseSpaces(draft.city);
  if (!city) errors.city = 'cityRequired';

  const phone = normalizePhone(draft.phone);
  if (!draft.phone.trim()) errors.phone = 'phoneRequired';
  else if (!phone) errors.phone = 'phoneInvalid';

  const email = draft.email.trim().toLowerCase();
  if (!email) errors.email = 'emailRequired';
  else if (!isValidEmail(email)) errors.email = 'emailInvalid';

  if (!draft.isAdult) errors.isAdult = 'adultRequired';

  if (Object.keys(errors).length > 0 || !phone) {
    return { errors, values: null };
  }
  return { errors, values: { name, city, phone, email, isAdult: true } };
}
