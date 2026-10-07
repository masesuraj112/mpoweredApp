import { validateEmail, validatePassword, validatePhone } from '@/services/validation';

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

describe('validatePassword', () => {
  it('accepts a password meeting every rule', () => {
    expect(validatePassword('Str0ng!pw')).toBe('');
  });

  it.each([
    ['Ab1!', 'Password must be at least 8 characters.'],
    ['password', 'Password must include a capital letter, a number and a symbol (e.g. ! @ # $).'],
    ['Password1', 'Password must include a symbol (e.g. ! @ # $).'],
    ['PASSWORD1!', 'Password must include a lowercase letter.'],
    ['Password!', 'Password must include a number.'],
    ['pass word1!', 'Password must include a capital letter.'],
  ])('rejects %p', (password, message) => {
    expect(validatePassword(password)).toBe(message);
  });
});
