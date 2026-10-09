/**
 * PL: Test adresów podtoru 5a bez bazy: bez numeru ucznia serwer odpowiada 401, z numerem, ale bez wiązania bazy (zgłoszenie #41), odpowiada 503 i niczego nie zapisuje.
 * EN: Test of the subtrack 5a routes without a database: without a student id the server answers 401, with an id but without the database binding (issue #41) it answers 503 and writes nothing.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Router, który sprawdzamy.
// EN: The router under test.
import { surveysVoteApp } from './routes';
// PL: Nazwa nagłówka z numerem ucznia.
// EN: The name of the student id header.
import { TEMPORARY_STUDENT_HEADER } from './temporaryStudent';

// PL: Numer ucznia o dozwolonym kształcie, wymyślony.
// EN: A student id of the allowed shape, invented.
const STUDENT_ID = 'test-student-0001';

// PL: Trzy adresy podtoru: lista, szczegóły i wysłanie odpowiedzi.
// EN: The three subtrack routes: the list, the details and sending the answers.
const ROUTES = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/dodatkowe' },
  { method: 'POST', path: '/dodatkowe/answers' },
];

// PL: Grupa testów adresów.
// EN: A group of tests for the routes.
describe('surveysVoteApp', () => {
  it.each(ROUTES)('$method $path bez numeru ucznia daje 401 / without a student id gives 401', async ({ method, path }) => {
    const response = await surveysVoteApp.request(path, { method });

    expect(response.status).toBe(401);
  });

  it('numer ucznia o złym kształcie daje 401 / a malformed student id gives 401', async () => {
    const response = await surveysVoteApp.request('/', { headers: { [TEMPORARY_STUDENT_HEADER]: 'za krótki; drop table' } });

    expect(response.status).toBe(401);
  });

  it.each(ROUTES)('$method $path bez bazy daje 503 / without the database gives 503', async ({ method, path }) => {
    const response = await surveysVoteApp.request(path, { method, headers: { [TEMPORARY_STUDENT_HEADER]: STUDENT_ID } });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'database_unavailable' });
  });
});
