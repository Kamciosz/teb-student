/**
 * PL: Testy kluczy dostępu (passkey) podtoru 1a: rejestracja wymaga sesji, tabela passkey istnieje w bazie testów, kasowanie konta usuwa klucze ucznia, a eksport RODO podaje tylko liczbę i nazwy.
 * EN: Tests of the passkeys of subtrack 1a: registration requires a session, the passkey table exists in the test database, deleting the account removes the student's keys, and the GDPR export gives only the count and the names.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/auth/email/routes.ts::createAuthEmailApp
 * @uses worker/auth/email/deleteStudentData.ts::deleteAuthStudentData
 * @uses worker/auth/email/passkeys.ts::listPasskeysForExport
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe z bazą D1 (binding DB, tabele ze schematu).
// EN: The test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
import { deleteAuthStudentData } from './deleteStudentData';
import { listPasskeysForExport } from './passkeys';
import { call, createTestRuntime, signIn } from './testRuntime';

/** PL: Wymyślone adresy dwóch uczniów. EN: Invented addresses of two students. */
const JAN = 'jan.test@teb.edu.pl';
const ANNA = 'anna.test@teb.edu.pl';

/**
 * PL: Dodaje klucz testowy do tabeli passkey (bez prawdziwych danych kryptograficznych).
 * EN: Adds a test key to the passkey table (without real cryptographic data).
 *
 * @param id - PL: numer klucza. EN: the key id.
 * @param userId - PL: numer właściciela klucza. EN: the id of the key's owner.
 * @param name - PL: nazwa klucza. EN: the key name.
 */
async function addPasskey(id: string, userId: string, name: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO passkey (id, name, public_key, user_id, credential_id, counter, device_type, backed_up) VALUES (?, ?, ?, ?, ?, 0, ?, 0)',
  )
    .bind(id, name, `klucz-testowy-${id}`, userId, `identyfikator-${id}`, 'singleDevice')
    .run();
}

// PL: Grupa testów rejestracji kluczy bez sesji.
// EN: A group of tests for registering keys without a session.
describe('passkey: rejestracja wymaga sesji / registration requires a session', () => {
  // PL: Bez zalogowania nie wolno zacząć rejestracji klucza.
  // EN: Without signing in, a key registration cannot start.
  it('opcje rejestracji bez sesji dają 401 / registration options without a session give 401', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, '/passkey/generate-register-options', { method: 'GET' });
    expect(response.status).toBe(401);
  });

  // PL: Bez zalogowania nie wolno zapisać klucza, nawet z poprawnym kształtem danych.
  // EN: Without signing in a key cannot be saved, even with a well-formed body.
  it('zapis klucza bez sesji daje 401 / saving a key without a session gives 401', async () => {
    const test = createTestRuntime();
    const response = await call(test.app, '/passkey/verify-registration', { body: { response: {} } });
    expect(response.status).toBe(401);
  });

  // PL: Z sesją opcje rejestracji dostają rpID wyliczone z adresu aplikacji (BETTER_AUTH_URL), a nie wpisane na sztywno.
  // EN: With a session the registration options get the rpID computed from the app address (BETTER_AUTH_URL), not a hard-coded one.
  it('z sesją rpID idzie z adresu aplikacji / with a session the rpID comes from the app address', async () => {
    const test = createTestRuntime(true, 'https://uczen.example.pl');
    const cookie = await signIn(test, JAN);
    const response = await call(test.app, '/passkey/generate-register-options', { method: 'GET', cookie });
    const body = (await response.json()) as { rp?: { id?: string }; error?: unknown };
    expect(response.status, JSON.stringify(body)).toBe(200);
    expect(body.rp?.id).toBe('uczen.example.pl');
  });
});

// PL: Grupa testów tabeli i kasowania kluczy.
// EN: A group of tests for the table and deleting keys.
describe('passkey: tabela i kasowanie / table and deletion', () => {
  // PL: Tabela passkey jest w bazie testów, bo jest generowana ze schematu Drizzle.
  // EN: The passkey table is in the test database, because it is generated from the Drizzle schema.
  it('tabela passkey istnieje w bazie testów / the passkey table exists in the test database', async () => {
    const row = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'passkey'").first<{ name: string }>();
    expect(row?.name).toBe('passkey');
  });

  // PL: Eksport RODO podaje liczbę kluczy i ich nazwy, bez kluczy kryptograficznych.
  // EN: The GDPR export gives the number of keys and their names, without cryptographic keys.
  it('eksport podaje liczbę i nazwy, bez kluczy / the export gives the count and names, without keys', async () => {
    const test = createTestRuntime();
    await signIn(test, JAN);
    const { internalAdapter } = await test.runtime.auth.$context;
    const jan = await internalAdapter.findUserByEmail(JAN);
    const janId = jan?.user.id ?? '';

    await addPasskey('klucz-eksport-1', janId, 'Telefon');
    await addPasskey('klucz-eksport-2', janId, 'Laptop');

    const exported = await listPasskeysForExport(env.DB, janId);
    expect(exported.count).toBe(2);
    expect([...exported.names].sort()).toEqual(['Laptop', 'Telefon']);
    expect(Object.keys(exported).sort()).toEqual(['count', 'names']);
  });

  // PL: Kasowanie konta usuwa klucze tego ucznia, a klucze drugiego ucznia zostają.
  // EN: Deleting the account removes this student's keys, and the other student's keys stay.
  it('kasowanie konta usuwa klucze ucznia, cudze zostają / deleting the account removes the student keys, others stay', async () => {
    const test = createTestRuntime();
    await signIn(test, JAN);
    await signIn(test, ANNA);
    const { internalAdapter } = await test.runtime.auth.$context;
    const jan = await internalAdapter.findUserByEmail(JAN);
    const anna = await internalAdapter.findUserByEmail(ANNA);
    const janId = jan?.user.id ?? '';
    const annaId = anna?.user.id ?? '';

    await addPasskey('klucz-jana-1', janId, 'Telefon Jana');
    await addPasskey('klucz-jana-2', janId, 'Laptop Jana');
    await addPasskey('klucz-anny-1', annaId, 'Telefon Anny');

    await deleteAuthStudentData({ userId: janId, db: env.DB });

    expect((await listPasskeysForExport(env.DB, janId)).count).toBe(0);
    const remaining = await env.DB.prepare('SELECT id FROM passkey WHERE user_id = ?').bind(annaId).all<{ id: string }>();
    expect(remaining.results.map((row) => row.id)).toEqual(['klucz-anny-1']);
  });
});
