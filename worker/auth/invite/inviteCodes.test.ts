/**
 * PL: Testy kodów zaproszeń: kształt kodu, ważność 14 dni, normalizacja wpisu ucznia, zużycie dokładnie raz, kod po terminie i oddanie kodu. Działają na prawdziwej bazie D1 testów.
 * EN: Tests of the invitation codes: the code shape, the 14-day validity, normalizing the student's input, using a code exactly once, an expired code and giving a code back. They run on the real test D1 database.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/inviteCodes.ts::issueInviteCode
 * @used_by vitest.config.ts::include
 */

import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { consumeInviteCode, issueInviteCode, normalizeInviteCode, restoreInviteCode } from './inviteCodes';

/** PL: Ile milisekund ma doba. EN: How many milliseconds a day has. */
const DAY_MS = 24 * 60 * 60 * 1000;

// PL: Grupa testów tworzenia kodu.
// EN: A group of code creation tests.
describe('tworzenie kodu / creating a code', () => {
  // PL: Kod ma kształt z ekranu 1.3 i jest ważny dokładnie 14 dni.
  // EN: The code has the shape from screen 1.3 and is valid for exactly 14 days.
  it('tworzy kod TEB-XXXX-XX ważny 14 dni / creates a TEB-XXXX-XX code valid for 14 days', async () => {
    const now = new Date('2026-10-20T10:00:00Z');
    const { code, expiresAt } = await issueInviteCode(env.DB, now);
    expect(code).toMatch(/^TEB-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{2}$/);
    expect(expiresAt.getTime()).toBe(now.getTime() + 14 * DAY_MS);
  });

  // PL: Dwa kody nie są takie same.
  // EN: Two codes are not the same.
  it('losuje różne kody / draws different codes', async () => {
    const first = await issueInviteCode(env.DB);
    const second = await issueInviteCode(env.DB);
    expect(first.code).not.toBe(second.code);
  });
});

// PL: Grupa testów wpisu ucznia.
// EN: A group of student input tests.
describe('normalizacja wpisu / input normalization', () => {
  // PL: Małe litery i spacje na brzegach nie przeszkadzają, zły kształt daje null.
  // EN: Lowercase and edge spaces do not matter, a wrong shape gives null.
  it.each([
    [' teb-7k4q-92 ', 'TEB-7K4Q-92'],
    ['TEB-7K4Q-92', 'TEB-7K4Q-92'],
    ['TEB7K4Q92', null],
    ['TEB-7K4Q-9', null],
    ['ABC-7K4Q-92', null],
    ['', null],
  ])('%j daje %j / gives %j', (raw, expected) => {
    expect(normalizeInviteCode(raw)).toBe(expected);
  });
});

// PL: Grupa testów zużycia.
// EN: A group of use tests.
describe('zużycie kodu / using a code', () => {
  // PL: Kod działa raz: drugie zużycie zwraca null.
  // EN: A code works once: the second use returns null.
  it('zużywa kod tylko raz / uses a code only once', async () => {
    const { code } = await issueInviteCode(env.DB);
    expect(await consumeInviteCode(env.DB, code)).not.toBeNull();
    expect(await consumeInviteCode(env.DB, code)).toBeNull();
  });

  // PL: Dwie próby naraz: dokładnie jedna wygrywa.
  // EN: Two attempts at once: exactly one wins.
  it('przy dwóch próbach naraz wygrywa jedna / with two attempts at once exactly one wins', async () => {
    const { code } = await issueInviteCode(env.DB);
    const results = await Promise.all([consumeInviteCode(env.DB, code), consumeInviteCode(env.DB, code)]);
    expect(results.filter((row) => row !== null)).toHaveLength(1);
  });

  // PL: Kod po 14 dniach nie działa, a tuż przed terminem działa.
  // EN: A code does not work after 14 days, and works right before the deadline.
  it('odrzuca kod po terminie / rejects a code after the deadline', async () => {
    const issuedAt = new Date('2026-10-01T00:00:00Z');
    const old = await issueInviteCode(env.DB, issuedAt);
    expect(await consumeInviteCode(env.DB, old.code, new Date(issuedAt.getTime() + 14 * DAY_MS + 1000))).toBeNull();
    const fresh = await issueInviteCode(env.DB, issuedAt);
    expect(await consumeInviteCode(env.DB, fresh.code, new Date(issuedAt.getTime() + 14 * DAY_MS - 1000))).not.toBeNull();
  });

  // PL: Oddany kod znów działa, z tym samym terminem.
  // EN: A code that was given back works again, with the same deadline.
  it('oddany kod znów działa / a restored code works again', async () => {
    const { code, expiresAt } = await issueInviteCode(env.DB);
    const row = await consumeInviteCode(env.DB, code);
    expect(row).not.toBeNull();
    if (row) await restoreInviteCode(env.DB, code, row);
    const again = await consumeInviteCode(env.DB, code);
    expect(again?.expiresAt.getTime()).toBe(expiresAt.getTime());
  });

  // PL: Nieistniejący kod nie jest zużyty.
  // EN: A code that does not exist is not used.
  it('nie zna nieistniejącego kodu / does not know a code that does not exist', async () => {
    expect(await consumeInviteCode(env.DB, 'TEB-AAAA-AA')).toBeNull();
  });
});
