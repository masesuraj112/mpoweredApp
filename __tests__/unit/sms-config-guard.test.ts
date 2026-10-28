/// <reference types="node" />
// Guard for the Twilio SMS work (docs/backend/twilio-otp-integration-guide.md, section 3).
// Reads supabase/config.toml and the tracked source files. Fails if a developer test login is
// removed, if the local Twilio provider is switched on, or if a Twilio secret is committed.

import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { extname, join } from 'path';

const ROOT = join(__dirname, '..', '..');
const readText = (path: string) => readFileSync(join(ROOT, path), 'utf8').replace(/\r\n/g, '\n');

/** The lines of one [section] of a TOML file, up to the next section header. */
function tomlSection(toml: string, name: string): string[] {
  const lines = toml.split('\n');
  const start = lines.findIndex((line) => line.trim() === `[${name}]`);
  if (start === -1) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^\s*\[/.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).filter((line) => !line.trim().startsWith('#'));
}

describe('supabase/config.toml', () => {
  const toml = readText('supabase/config.toml');

  it.each(['61491570006', '61491570007'])('keeps developer test login %s with code 123456', (n) => {
    expect(tomlSection(toml, 'auth.sms.test_otp')).toContain(`${n} = "123456"`);
  });

  it('keeps the local Twilio provider switched off', () => {
    const twilio = tomlSection(toml, 'auth.sms.twilio');
    expect(twilio.length).toBeGreaterThan(0);
    expect(twilio).toContainEqual(expect.stringMatching(/^enabled\s*=\s*false\s*$/));
  });

  it('holds no Twilio value except an env() reference', () => {
    const twilio = tomlSection(toml, 'auth.sms.twilio');
    const token = twilio.find((line) => line.startsWith('auth_token'));
    expect(token).toMatch(/=\s*"env\([A-Z0-9_]+\)"\s*$/);
    ['account_sid', 'message_service_sid'].forEach((key) => {
      const line = twilio.find((l) => l.startsWith(key));
      expect(line).toMatch(new RegExp(`^${key}\\s*=\\s*(""|"env\\([A-Z0-9_]+\\)")\\s*$`));
    });
  });
});

// Built from pieces so this file never contains a string the patterns would match.
const SECRET_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'Account SID (AC + 32 hex)', pattern: /(?<![A-Za-z0-9])AC[0-9a-fA-F]{32}(?![A-Za-z0-9])/ },
  { name: 'API key or Messaging Service SID (SK/MG + 32 hex)', pattern: /(?<![A-Za-z0-9])(SK|MG)[0-9a-fA-F]{32}(?![A-Za-z0-9])/ },
  {
    name: 'long token next to the word twilio',
    pattern: /twilio[^\r\n]{0,80}?(?<![A-Za-z0-9_])[A-Za-z0-9]{32,}(?![A-Za-z0-9_])/i,
  },
  {
    name: 'long token before the word twilio',
    pattern: /(?<![A-Za-z0-9_])[A-Za-z0-9]{32,}(?![A-Za-z0-9_])[^\r\n]{0,80}?twilio/i,
  },
];

const hits = (text: string) => SECRET_PATTERNS.filter((p) => p.pattern.test(text)).map((p) => p.name);

describe('Twilio secret patterns', () => {
  const hex32 = 'a1b2c3d4'.repeat(4);

  it('catch an Account SID, an API key and a Messaging Service SID', () => {
    expect(hits(`sid: ${'A' + 'C'}${hex32}`)).toContain('Account SID (AC + 32 hex)');
    expect(hits(`key = "${'S' + 'K'}${hex32}"`)).toContain('API key or Messaging Service SID (SK/MG + 32 hex)');
    expect(hits(`service ${'M' + 'G'}${hex32}`)).toContain('API key or Messaging Service SID (SK/MG + 32 hex)');
  });

  it('catch a long token written next to the word twilio', () => {
    const token = 'x9Y8'.repeat(8);
    expect(hits(`twilio auth token: ${token}`)).not.toHaveLength(0);
    expect(hits(`${token} # twilio`)).not.toHaveLength(0);
  });

  it('leave variable names, placeholders and URLs alone', () => {
    expect(hits('auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"')).toEqual([]);
    expect(hits('Account SID (`AC…`), Auth Token and Messaging Service SID (`MG…`)')).toEqual([]);
    expect(hits('https://www.twilio.com/en-us/sms/pricing/au')).toEqual([]);
  });
});

describe('tracked files', () => {
  const TEXT_EXTENSIONS = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.toml', '.yml', '.yaml', '.sql', '.xml', '.txt', '.env', '.example', '.sh',
  ]);
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0')
    .filter((f) => f && f !== 'package-lock.json' && TEXT_EXTENSIONS.has(extname(f)));

  it('finds files to scan', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('contain no Twilio-style secret', () => {
    const found = files.flatMap((file) => {
      const text = readText(file);
      return hits(text).map((name) => `${file}: ${name}`);
    });
    expect(found).toEqual([]);
  });
});
