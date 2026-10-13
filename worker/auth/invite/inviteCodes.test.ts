/**
 * PL: Testy kodów zaproszeń: kształt kodu, ważność 14 dni, normalizacja wpisu ucznia, zużycie dokładnie raz, kod po terminie, oddanie kodu i lista kodów, które jeszcze działają. Działają na prawdziwej bazie D1 testów. Listę sprawdzamy przez drzwi modułu, tak jak bierze ją panel.
 * EN: Tests of the invitation codes: the code shape, the 14-day validity, normalizing the student's input, using a code exactly once, an expired code, giving a code back and the list of codes that still work. They run on the real test D1 database. The list is checked through the module door, the way the panel takes it.
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses worker/auth/invite/inviteCodes.ts::issueInviteCode
 * @uses worker/auth/index.ts::listInviteCodes
 * @used_by vitest.config.ts::include
 */

import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { listInviteCodes } from '../index';
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

// PL: Grupa testów listy kodów, które jeszcze działają.
// EN: A group of tests of the list of codes that still work.
describe('lista kodów / list of codes', () => {
  // PL: Lista pokazuje kod ważny, a nie pokazuje kodu po terminie ani zużytego.
  // EN: The list shows a valid code, and does not show an expired or a used code.
  it('pokazuje tylko kody ważne i niezużyte / shows only valid and unused codes', async () => {
    const now = new Date('2026-10-20T10:00:00Z');
    const valid = await issueInviteCode(env.DB, now);
    const expired = await issueInviteCode(env.DB, new Date('2026-10-01T00:00:00Z'));
    const used = await issueInviteCode(env.DB, now);
    await consumeInviteCode(env.DB, used.code, now);
    const codes = (await listInviteCodes(env.DB, now)).map((item) => item.code);
    expect(codes).toContain(valid.code);
    expect(codes).not.toContain(expired.code);
    expect(codes).not.toContain(used.code);
  });

  // PL: Lista idzie od najkrócej ważnego, więc kod wydany wcześniej stoi przed nowszym.
  // EN: The list runs from the code valid for the shortest time, so a code issued earlier stands before a newer one.
  it('sortuje od najkrótszego terminu / sorts from the shortest deadline', async () => {
    const now = new Date('2026-10-20T10:00:00Z');
    const earlier = await issueInviteCode(env.DB, new Date('2026-10-18T10:00:00Z'));
    const later = await issueInviteCode(env.DB, new Date('2026-10-20T09:00:00Z'));
    const items = await listInviteCodes(env.DB, now);
    const codes = items.map((item) => item.code);
    expect(codes.indexOf(earlier.code)).toBeLessThan(codes.indexOf(later.code));
    const times = items.map((item) => item.expiresAt.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  // PL: Termin na liście to ten sam termin, który dostał kod przy tworzeniu.
  // EN: The deadline on the list is the same deadline the code got when it was created.
  it('podaje termin z chwili tworzenia / gives the deadline from the moment of creation', async () => {
    const now = new Date('2026-10-20T10:00:00Z');
    const { code, expiresAt } = await issueInviteCode(env.DB, now);
    const item = (await listInviteCodes(env.DB, now)).find((entry) => entry.code === code);
    expect(item?.expiresAt.getTime()).toBe(expiresAt.getTime());
  });
});
