/**
 * PL: Test adresów podtoru 5a na prawdziwej bazie D1: lista i szczegóły bez liczników głosów, zapis głosu, drugi głos tego samego ucznia (409, liczniki bez zmian), ankieta zakończona (410), złe odpowiedzi (400), brak ucznia (401) i brak ankiety (404). Tabele ze schematu zakłada vitest.config.ts, a test wkłada własne wiersze z odległymi datami, więc nie zależy od dnia uruchomienia.
 * EN: Test of the subtrack 5a routes on a real D1 database: the list and the details without vote counters, writing a vote, a second vote from the same student (409, counters unchanged), an ended survey (410), bad answers (400), no student (401) and no survey (404). The tables from the schema are created by vitest.config.ts, and the test inserts its own rows with distant dates, so it does not depend on the day it runs.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/routes.ts::surveysVoteApp
 * @uses worker/db/schema/surveys.ts::surveys
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeAll, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do wkładania wierszy testowych.
// EN: The database client for inserting test rows.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele ankiet.
// EN: The survey tables.
import { surveyOptions, surveyParticipation, surveyQuestions, surveys } from '../../db/schema/surveys';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { surveysVoteApp } from './routes';
// PL: Nazwa nagłówka z numerem ucznia.
// EN: The name of the student id header.
import { TEMPORARY_STUDENT_HEADER } from './temporaryStudent';

// PL: Klient bazy testowej.
// EN: The test database client.
const db = drizzle(env.DB);

// PL: Pełna odpowiedź na trwającą ankietę: po jednej odpowiedzi do każdego z dwóch pytań.
// EN: A full answer to the running survey: one option for each of the two questions.
const OPEN_ANSWERS = { answers: [{ questionId: 'open-1', optionId: 'open-1-a' }, { questionId: 'open-2', optionId: 'open-2-b' }] };

/**
 * PL: Wysyła zapytanie do routera na bazie testowej, jako uczeń o podanym numerze albo bez ucznia.
 * EN: Sends a request to the router on the test database, as the student with the given id or without a student.
 *
 * @param path - PL: adres względem /api/surveys/vote. EN: the path relative to /api/surveys/vote.
 * @param student - PL: numer ucznia albo null bez nagłówka. EN: the student id, or null for no header.
 * @param body - PL: treść POST albo undefined dla GET. EN: the POST body, or undefined for GET.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function call(path: string, student: string | null, body?: unknown): Promise<Response> | Response {
  // PL: Nagłówki: numer ucznia i, przy POST, typ treści.
  // EN: The headers: the student id and, for POST, the content type.
  const headers: Record<string, string> = {};
  if (student !== null) headers[TEMPORARY_STUDENT_HEADER] = student;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return surveysVoteApp.request(path, { method: body === undefined ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body) }, env);
}

/**
 * PL: Czyta liczniki głosów wszystkich odpowiedzi trwającej ankiety.
 * EN: Reads the vote counters of all options of the running survey.
 *
 * @returns PL: mapa numer odpowiedzi do licznika. EN: a map of option id to counter.
 */
async function readCounters(): Promise<Record<string, number>> {
  // PL: Wiersze z numerem i licznikiem.
  // EN: Rows with the id and the counter.
  const rows = await db.select({ id: surveyOptions.id, votes: surveyOptions.votes }).from(surveyOptions);
  return Object.fromEntries(rows.map((row) => [row.id, row.votes]));
}

// PL: Dwie ankiety testowe: trwająca do 2099 roku i zakończona w 2020.
// EN: Two test surveys: one running until 2099 and one ended in 2020.
beforeAll(async () => {
  await db.insert(surveys).values([
    { id: 'open', label: 'Test', title: 'Trwająca', endsOn: '2099-12-31' },
    { id: 'closed', label: null, title: 'Zakończona', endsOn: '2020-01-01' },
  ]);
  await db.insert(surveyQuestions).values([
    { id: 'open-1', surveyId: 'open', position: 1, prompt: 'Pierwsze?' },
    { id: 'open-2', surveyId: 'open', position: 2, prompt: 'Drugie?' },
    { id: 'closed-1', surveyId: 'closed', position: 1, prompt: 'Zamknięte?' },
  ]);
  await db.insert(surveyOptions).values([
    { id: 'open-1-a', questionId: 'open-1', position: 1, label: 'A' },
    { id: 'open-1-b', questionId: 'open-1', position: 2, label: 'B' },
    { id: 'open-2-a', questionId: 'open-2', position: 1, label: 'C' },
    { id: 'open-2-b', questionId: 'open-2', position: 2, label: 'D' },
    { id: 'closed-1-a', questionId: 'closed-1', position: 1, label: 'E' },
  ]);
});

// PL: Dostęp: bez ucznia 401, nieznana ankieta 404.
// EN: Access: no student gives 401, an unknown survey gives 404.
describe('dostęp / access', () => {
  it.each([
    { path: '/', body: undefined },
    { path: '/open', body: undefined },
    { path: '/open/answers', body: OPEN_ANSWERS },
  ])('$path bez numeru ucznia daje 401 / without a student id gives 401', async ({ path, body }) => {
    expect((await call(path, null, body)).status).toBe(401);
  });

  it('numer ucznia o złym kształcie daje 401 / a malformed student id gives 401', async () => {
    expect((await call('/', 'za krotki; drop table')).status).toBe(401);
  });

});

// PL: Odczyt: lista i szczegóły, zawsze bez liczników głosów.
// EN: Reading: the list and the details, always without vote counters.
describe('odczyt / reading', () => {
  it('lista dzieli ankiety na trwające i zakończone, bez liczników / the list splits running and ended surveys, without counters', async () => {
    const response = await call('/', 'student-list-0001');
    const text = await response.text();
    const body = JSON.parse(text) as { active: { id: string; questionCount: number; hasVoted: boolean }[]; ended: { id: string }[] };

    expect(response.status).toBe(200);
    expect(body.active).toMatchObject([{ id: 'open', questionCount: 2, hasVoted: false }]);
    expect(body.ended.map((survey) => survey.id)).toEqual(['closed']);
    expect(text).not.toContain('votes');
  });

  it('szczegóły ankiety mają pytania i odpowiedzi, ale bez liczników / the details have questions and options, but no counters', async () => {
    const response = await call('/open', 'student-detail-0001');
    const text = await response.text();
    const body = JSON.parse(text) as { isActive: boolean; hasVoted: boolean; questions: { id: string; options: { id: string }[] }[] };

    expect(response.status).toBe(200);
    expect(body.isActive).toBe(true);
    expect(body.hasVoted).toBe(false);
    expect(body.questions.map((q) => [q.id, q.options.length])).toEqual([['open-1', 2], ['open-2', 2]]);
    expect(text).not.toContain('votes');
  });
});

// PL: Zapis głosu: liczniki, drugi głos i brak śladu odpowiedzi.
// EN: Writing a vote: the counters, a second vote and no trace of answers.
describe('zapis głosu / writing a vote', () => {
  it('głos zwiększa liczniki, drugi głos daje 409 i niczego nie zmienia, a lista pokazuje „wypełniona” / a vote raises the counters, a second vote gives 409 and changes nothing, and the list shows "filled"', async () => {
    const student = 'student-vote-00001';
    const first = await call('/open/answers', student, OPEN_ANSWERS);
    const countersAfterFirst = await readCounters();
    const second = await call('/open/answers', student, OPEN_ANSWERS);
    const countersAfterSecond = await readCounters();
    const list = (await (await call('/', student)).json()) as { active: { hasVoted: boolean }[] };

    expect(first.status).toBe(201);
    expect(countersAfterFirst).toMatchObject({ 'open-1-a': 1, 'open-1-b': 0, 'open-2-a': 0, 'open-2-b': 1 });
    expect(second.status).toBe(409);
    expect(countersAfterSecond).toEqual(countersAfterFirst);
    expect(list.active[0]?.hasVoted).toBe(true);
  });

  it('drugi uczeń głosuje niezależnie / another student votes independently', async () => {
    const before = await readCounters();
    const response = await call('/open/answers', 'student-vote-00002', OPEN_ANSWERS);
    const after = await readCounters();

    expect(response.status).toBe(201);
    expect(after['open-1-a']).toBe((before['open-1-a'] ?? 0) + 1);
  });

  it('zapis nie zostawia śladu odpowiedzi ucznia, tylko udział / the write leaves no trace of the student answers, only participation', async () => {
    const rows = await db.select().from(surveyParticipation);

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(Object.keys(row).sort()).toEqual(['surveyId', 'userId']);
  });

});

// PL: Odrzucenia: ankieta zakończona i złe odpowiedzi nic nie zapisują.
// EN: Rejections: an ended survey and bad answers write nothing.
describe('odrzucenia / rejections', () => {
  it('nieznana ankieta daje 404 / an unknown survey gives 404', async () => {
    expect((await call('/nie-ma', 'student-404-00001')).status).toBe(404);
    expect((await call('/nie-ma/answers', 'student-404-00001', OPEN_ANSWERS)).status).toBe(404);
  });

  it('ankieta zakończona daje 410 i nie zmienia liczników / an ended survey gives 410 and changes no counters', async () => {
    const before = await readCounters();
    const response = await call('/closed/answers', 'student-ended-0001', { answers: [{ questionId: 'closed-1', optionId: 'closed-1-a' }] });

    expect(response.status).toBe(410);
    expect(await readCounters()).toEqual(before);
  });

  it.each([
    { name: 'odpowiedź z cudzego pytania / an option of a foreign question', body: { answers: [{ questionId: 'open-1', optionId: 'closed-1-a' }, { questionId: 'open-2', optionId: 'open-2-a' }] } },
    { name: 'brak jednego pytania / a missing question', body: { answers: [{ questionId: 'open-1', optionId: 'open-1-a' }] } },
    { name: 'puste dane / an empty body', body: {} },
  ])('złe odpowiedzi: $name, daje 400 i niczego nie zapisuje / bad answers give 400 and write nothing', async ({ body }) => {
    const before = await readCounters();
    const response = await call('/open/answers', 'student-bad-000001', body);
    const participation = await db.select().from(surveyParticipation);

    expect(response.status).toBe(400);
    expect(await readCounters()).toEqual(before);
    expect(participation.some((row) => row.userId === 'student-bad-000001')).toBe(false);
  });
});
