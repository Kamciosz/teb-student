/**
 * PL: Test pliku z pilotażu na prawdziwej bazie D1. Sprawdza, że administrator dostaje plik CSV z trzema liczbami zgodnymi z bazą, że Samorząd i uczeń dostają 403, i że treść pliku nie ma adresów e-mail ani imion (test na treść odpowiedzi, a imię konta jest ustawione przed pobraniem).
 * EN: Test of the pilot file on a real D1 database. Checks that the administrator gets a CSV file with three numbers that match the database, that the Council and a student get 403, and that the file content has no e-mail addresses or names (a test on the response body, with an account name set before the download).
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/admin/testSession.ts::setUpPanel
 * @uses worker/admin/testSession.ts::callAdmin
 * @uses worker/auth/index.ts::countStudents
 * @uses worker/reports/index.ts::countReports
 * @uses worker/surveys/index.ts::countSurveyParticipations
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (liczniki biorą surowy binding bazy).
// EN: The Worker test environment with the D1 database (the counters take the raw database binding).
import { env } from 'cloudflare:workers';
// PL: Warunek do zmiany imienia konta w teście.
// EN: The condition to change an account's name in the test.
import { eq } from 'drizzle-orm';
import { user } from '../db/schema/auth';
// PL: Liczby z drzwi modułów, z którymi plik ma się zgadzać.
// EN: The numbers from the module doors that the file must match.
import { countStudents } from '../auth';
import { countReports } from '../reports';
import { countSurveyParticipations } from '../surveys';
// PL: Wspólne narzędzia testów panelu i adresy kont.
// EN: The shared panel test tools and the account addresses.
import { EMAILS, callAdmin, db, setUpPanel, type Who } from './testSession';

// PL: Ciasteczka kont z tego pliku, ustawiane przed każdym testem.
// EN: The cookies of the accounts in this file, set before every test.
let cookies: Record<Who, string>;

beforeEach(async () => {
  cookies = await setUpPanel();
});

// PL: Grupa testów pobierania pliku.
// EN: A group of tests for downloading the file.
describe('GET /pilot', () => {
  it('Samorząd i uczeń dostają 403, a bez sesji 401 / the Council and a student get 403, and without a session 401', async () => {
    expect((await callAdmin('/pilot', 'GET', null)).status).toBe(401);
    expect((await callAdmin('/pilot', 'GET', cookies.plain)).status).toBe(403);
    expect((await callAdmin('/pilot', 'GET', cookies.council)).status).toBe(403);
  });

  it('administrator dostaje plik CSV z trzema liczbami zgodnymi z bazą / the administrator gets a CSV file with three numbers that match the database', async () => {
    const response = await callAdmin('/pilot', 'GET', cookies.admin);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('pilotaz.csv');

    // PL: Zdejmij znak kolejności bajtów i rozbij plik na wiersze.
    // EN: Remove the byte order mark and split the file into rows.
    const rows = (await response.text()).replace(/^﻿/, '').split('\r\n').filter((row) => row !== '');
    expect(rows).toEqual([
      ['Wskaźnik', 'Liczba'].join(','),
      `Ile osób się zalogowało,${await countStudents(env.DB)}`,
      `Ile zgłoszeń wpłynęło,${await countReports(env.DB)}`,
      `Ile odpowiedzi dały ankiety,${await countSurveyParticipations(env.DB)}`,
    ]);
  });

  it('treść pliku nie ma adresów e-mail ani imion / the file content has no e-mail addresses or names', async () => {
    // PL: Nadaj kontom imiona i nazwiska, żeby test miał co wykryć.
    // EN: Give the accounts a first and last name, so the test has something to catch.
    await db.update(user).set({ name: 'Ola Testowa' }).where(eq(user.email, EMAILS.plain));
    await db.update(user).set({ name: 'Jan Przykładowy' }).where(eq(user.email, EMAILS.editor));

    // PL: Sprawdź treść odpowiedzi, a nie tylko kod odpowiedzi.
    // EN: Check the content of the response, not only the status code.
    const text = await (await callAdmin('/pilot', 'GET', cookies.admin)).text();
    expect(text).not.toContain('@');
    expect(text).not.toContain('Ola');
    expect(text).not.toContain('Testowa');
    expect(text).not.toContain('Jan');
    expect(text).not.toContain('Przykładowy');
  });
});
