import { getGreeting } from './greeting';

const at = (hour: number, minute = 0) => new Date(2026, 5, 10, hour, minute);

describe('getGreeting', () => {
  it('says good morning before midday, like the design', () => {
    expect(getGreeting('Alex', at(9, 30))).toBe('Good morning, Alex ☀️');
    expect(getGreeting('Alex', at(0))).toBe('Good morning, Alex ☀️');
    expect(getGreeting('Alex', at(11, 59))).toBe('Good morning, Alex ☀️');
  });

  it('says good afternoon from midday until 5pm', () => {
    expect(getGreeting('Alex', at(12))).toBe('Good afternoon, Alex 🌤️');
    expect(getGreeting('Alex', at(16, 59))).toBe('Good afternoon, Alex 🌤️');
  });

  it('says good evening from 5pm', () => {
    expect(getGreeting('Alex', at(17))).toBe('Good evening, Alex 🌙');
    expect(getGreeting('Alex', at(23, 59))).toBe('Good evening, Alex 🌙');
  });

  it('uses only the first name', () => {
    expect(getGreeting('Alex Taylor', at(9))).toBe('Good morning, Alex ☀️');
  });

  it('leaves the name out when there is none', () => {
    expect(getGreeting('  ', at(9))).toBe('Good morning ☀️');
  });
});
