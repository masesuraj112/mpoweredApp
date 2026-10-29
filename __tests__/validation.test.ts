import { validateEmail, validatePhone, validateYearOfBirth } from '@/services/validation';

describe('validateEmail', () => {
  it.each(['sarah.mclachlan@gmail.com', 'a+tag@sub.example.com.au', ' name@example.io '])('accepts %s', email => {
    expect(validateEmail(email)).toBe('');
  });

  it.each([
    ['', 'Please enter an email address.'],
    ['john doe@gmail.com', "Email addresses can't contain spaces."],
    ['john.gmail.com', 'Email addresses need exactly one @, e.g. name@example.com.'],
    ['a@b@c.com', 'Email addresses need exactly one @, e.g. name@example.com.'],
    ['john..doe@gmail.com', "Email addresses can't contain two dots in a row."],
    ['john@gmail', 'Please enter a valid email address, e.g. name@example.com.'],
    ['john@gmail.c', 'Please enter a valid email address, e.g. name@example.com.'],
    ['john@.com', 'Please enter a valid email address, e.g. name@example.com.'],
  ])('rejects %p', (email, message) => {
    expect(validateEmail(email)).toBe(message);
  });

  it('allows empty when optional', () => {
    expect(validateEmail('  ', { required: false })).toBe('');
  });
});

describe('validatePhone', () => {
  it.each(['0400 000 000', '0400-000-000', '(02) 9876 5432', '+61 400 000 000', '0812345678'])('accepts %s', phone => {
    expect(validatePhone(phone)).toBe('');
  });

  it.each([
    ['', 'Please enter a phone number.'],
    ['0400 abc 000', 'Phone numbers can only contain digits, spaces and a leading +.'],
    ['0400 000 00', 'Please enter a valid Australian phone number, e.g. 0400 000 000.'],
    ['0500 000 000', 'Please enter a valid Australian phone number, e.g. 0400 000 000.'],
    ['+61 0400 000 000', 'Please enter a valid Australian phone number, e.g. 0400 000 000.'],
  ])('rejects %p', (phone, message) => {
    expect(validatePhone(phone)).toBe(message);
  });

  it('allows empty when optional', () => {
    expect(validatePhone('', { required: false })).toBe('');
  });
});

describe('validateYearOfBirth', () => {
  it.each([null, 1900, 1968, 2026])('accepts %p', year => {
    expect(validateYearOfBirth(year, 2026)).toBe('');
  });

  it.each([1899, 2027, 1968.5, Number.NaN])('rejects %p', year => {
    expect(validateYearOfBirth(year, 2026)).toBe('Please enter a year between 1900 and 2026.');
  });

  it('uses this year when none is given', () => {
    const thisYear = new Date().getFullYear();
    expect(validateYearOfBirth(thisYear)).toBe('');
    expect(validateYearOfBirth(thisYear + 1)).not.toBe('');
  });
});
