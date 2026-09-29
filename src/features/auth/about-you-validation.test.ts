import {
  isValidEmail,
  normalizePhone,
  toLatinDigits,
  validateAboutYou,
} from './about-you-validation';

describe('normalizePhone', () => {
  it.each([
    ['5305550101', '+15305550101'],
    ['(530) 555-0101', '+15305550101'],
    ['530.555.0101', '+15305550101'],
    ['1 530 555 0101', '+15305550101'],
    ['+1 530 555 0101', '+15305550101'],
    ['+91 98765 43210', '+919876543210'],
    ['੫੩੦੫੫੫੦੧੦੧', '+15305550101'],
  ])('accepts %s', (typed, stored) => {
    expect(normalizePhone(typed)).toBe(stored);
  });

  it.each(['555 0101', '0305550101', '1305550101', '5301550101', '+12', 'call me'])(
    'refuses %s',
    (typed) => {
      expect(normalizePhone(typed)).toBeNull();
    },
  );
});

describe('toLatinDigits', () => {
  it('turns Gurmukhi digits into 0-9', () => {
    expect(toLatinDigits('੧੨੩ abc ੦')).toBe('123 abc 0');
  });
});

describe('isValidEmail', () => {
  it('accepts normal addresses and refuses broken ones', () => {
    expect(isValidEmail('harjit@example.com')).toBe(true);
    expect(isValidEmail('harjit@example')).toBe(false);
    expect(isValidEmail('harjit example.com')).toBe(false);
  });
});

describe('validateAboutYou', () => {
  const complete = {
    name: '  Harjit   Kaur ',
    city: ' Yuba City ',
    phone: '(530) 555-0101',
    email: ' Harjit@Example.COM ',
    isAdult: true,
  };

  it('cleans up a complete form', () => {
    expect(validateAboutYou(complete)).toEqual({
      errors: {},
      values: {
        name: 'Harjit Kaur',
        city: 'Yuba City',
        phone: '+15305550101',
        email: 'harjit@example.com',
        isAdult: true,
      },
    });
  });

  it('says what is missing or wrong, field by field', () => {
    const { errors, values } = validateAboutYou({
      name: ' ',
      city: '',
      phone: '555',
      email: 'nope',
      isAdult: false,
    });
    expect(values).toBeNull();
    expect(errors).toEqual({
      name: 'nameRequired',
      city: 'cityRequired',
      phone: 'phoneInvalid',
      email: 'emailInvalid',
      isAdult: 'adultRequired',
    });
  });

  it('never submits without the 18+ box', () => {
    expect(validateAboutYou({ ...complete, isAdult: false }).values).toBeNull();
  });
});
