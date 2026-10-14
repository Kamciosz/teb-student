/**
 * PL: Test routera podtoru 2 na prawdziwej bazie D1 i zasobniku R2 z testowego Workera. Sprawdza 401 bez sesji, 403 dla ucznia bez roli redaktora, 201 dla redaktora (wiersz z jego numerem), 415 dla złego typu oraz odczyt pliku i opisu dla ucznia.
 * EN: Test of the subtrack 2 router on a real D1 database and R2 bucket of the test Worker. Checks 401 without a session, 403 for a student without the editor role, 201 for an editor (a row with their id), 415 for a bad type, and reading the file and its description for a student.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/media/routes.ts::mediaApp
 * @uses worker/auth/email/testRuntime.ts::signIn
 * @uses worker/db/schema/admin.ts::panelRoles
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1 i zasobnik R2).
// EN: The Worker test environment (the D1 database and the R2 bucket).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do przygotowania danych i odczytu wyniku.
// EN: The database client to prepare the data and read the result.
import { drizzle } from 'drizzle-orm/d1';
// PL: Logowanie ucznia w teście, tak jak w testach podtoru 4a.
// EN: Signing a student in within a test, as in the tests of subtrack 4a.
import { createTestRuntime, signIn } from '../auth/email/testRuntime';
// PL: Router, który sprawdzamy, i tabele.
// EN: The router under test, and the tables.
import { mediaApp } from './routes';
import { panelRoles } from '../db/schema/admin';
import { mediaFiles } from '../db/schema/media';
import { MAX_PHOTO_BYTES } from './rules';

/** PL: Sekret podpisu sesji z testRuntime.ts. EN: The session signing secret from testRuntime.ts. */
const TEST_SECRET = 'test-secret-test-secret-test-secret-00';

/** PL: Ciasteczko sesji ucznia z bieżącego testu. EN: The session cookie of the student in the current test. */
let cookie: string;

/** PL: Numer ucznia z bieżącego testu. EN: The id of the student in the current test. */
let studentId: string;

/**
 * PL: Wysyła zapytanie do routera, z ciasteczkiem sesji albo bez niego.
 * EN: Sends a request to the router, with the session cookie or without it.
 *
 * @param path - PL: adres względem routera. EN: the address relative to the router.
 * @param init - PL: metoda, nagłówki i treść. EN: the method, headers and body.
 * @param signedIn - PL: czy dołączyć ciasteczko (domyślnie tak). EN: whether to attach the cookie (yes by default).
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function send(path: string, init: RequestInit = {}, signedIn = true): Response | Promise<Response> {
  // PL: Nagłówki z ciasteczkiem albo bez niego.
  // EN: The headers with the cookie or without it.
  const headers = { ...(init.headers as Record<string, string> | undefined), ...(signedIn ? { cookie } : {}) };
  return mediaApp.request(path, { ...init, headers }, { ...env, BETTER_AUTH_SECRET: TEST_SECRET });
}

/**
 * PL: Wysyła plik testowy (trzy bajty) na /upload z podanym typem.
 * EN: Sends a test file (three bytes) to /upload with the given type.
 *
 * @param mime - PL: typ zawartości. EN: the content type.
 * @param query - PL: część adresu z wymiarami. EN: the part of the address with the dimensions.
 * @returns PL: odpowiedź routera. EN: the router response.
 */
function upload(mime: string, query = '?width=800&height=600'): Response | Promise<Response> {
  return send(`/upload${query}`, { method: 'POST', headers: { 'content-type': mime }, body: new Uint8Array([1, 2, 3]) });
}

// PL: Przed każdym testem: czysta baza, zalogowany uczeń bez roli.
// EN: Before every test: a clean database, a signed-in student without a role.
beforeEach(async () => {
  const db = drizzle(env.DB);
  await db.delete(mediaFiles);
  await db.delete(panelRoles);
  const login = createTestRuntime();
  cookie = await signIn(login, 'jan.test@teb.edu.pl');
  const session = await login.runtime.auth.api.getSession({ headers: new Headers({ cookie }) });
  studentId = session?.user.id ?? '';
});

// PL: Grupa testów dostępu do wysyłki.
// EN: A group of tests for access to the upload.
describe('POST /upload dostęp / access', () => {
  // PL: Bez sesji 401 i nic nie zapisane.
  // EN: Without a session 401 and nothing saved.
  it('bez sesji daje 401 i nic nie zapisuje / without a session gives 401 and saves nothing', async () => {
    const response = await send('/upload?width=800&height=600', { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: new Uint8Array([1]) }, false);
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(401);
    expect(rows).toHaveLength(0);
  });

  // PL: Uczeń bez roli redaktora dostaje 403 i nic nie zapisuje.
  // EN: A student without the editor role gets 403 and saves nothing.
  it('uczeń bez roli redaktora daje 403 / a student without the editor role gets 403', async () => {
    const response = await upload('image/jpeg');
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'forbidden' });
    expect(rows).toHaveLength(0);
  });

  // PL: Redaktor zapisuje plik: 201, a w bazie jego numer jako autor.
  // EN: An editor saves a file: 201, and the database has their id as the author.
  it('redaktor zapisuje zdjęcie: 201 i autor z sesji / an editor saves a photo: 201 and the author from the session', async () => {
    await drizzle(env.DB).insert(panelRoles).values({ userId: studentId, role: 'editor', grantedAt: Date.now() });
    const response = await upload('image/jpeg');
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(201);
    expect(rows).toEqual([expect.objectContaining({ kind: 'photo', width: 800, height: 600, uploadedBy: studentId })]);
  });

  // PL: Zły typ pliku dostaje 415 i nic nie zapisuje.
  // EN: A bad file type gets 415 and saves nothing.
  it('zły typ pliku daje 415 / a bad file type gives 415', async () => {
    await drizzle(env.DB).insert(panelRoles).values({ userId: studentId, role: 'editor', grantedAt: Date.now() });
    const response = await upload('application/pdf');
    expect(response.status).toBe(415);
  });
});

// PL: Grupa testów odczytu dla ucznia.
// EN: A group of tests for reading as a student.
describe('odczyt dla ucznia / reading as a student', () => {
  // PL: Opis pliku bez numeru autora i treść pliku z R2.
  // EN: The file description without the author id, and the file content from R2.
  it('GET /:id/meta i GET /:id oddają plik zalogowanemu uczniowi / GET /:id/meta and GET /:id return the file to a signed-in student', async () => {
    await drizzle(env.DB).insert(mediaFiles).values({ id: 'test-plik', kind: 'photo', mime: 'image/jpeg', size: 3, width: 800, height: 600, uploadedBy: studentId, createdAt: 1 });
    await env.MEDIA.put('test-plik', new Uint8Array([1, 2, 3]), { httpMetadata: { contentType: 'image/jpeg' } });

    const meta = await send('/test-plik/meta');
    const file = await send('/test-plik');
    expect(meta.status).toBe(200);
    expect(await meta.json()).toEqual({ id: 'test-plik', kind: 'photo', mime: 'image/jpeg', size: 3, width: 800, height: 600 });
    expect(file.status).toBe(200);
    expect(file.headers.get('content-type')).toBe('image/jpeg');
    expect(new Uint8Array(await file.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  // PL: Bez sesji odczyt daje 401.
  // EN: Without a session reading gives 401.
  it('bez sesji odczyt daje 401 / without a session reading gives 401', async () => {
    const response = await send('/test-plik/meta', {}, false);
    expect(response.status).toBe(401);
  });
});

// PL: Grupa testów zdjęcia do zgłoszenia od ucznia bez roli.
// EN: A group of tests for a photo for a report from a student without a role.
describe('POST /report-photo', () => {
  /**
   * PL: Wysyła zdjęcie do zgłoszenia z podanym typem i treścią.
   * EN: Sends a photo for a report with the given type and body.
   *
   * @param mime - PL: typ zawartości. EN: the content type.
   * @param body - PL: treść pliku. EN: the file body.
   * @returns PL: odpowiedź routera. EN: the router response.
   */
  function report(mime: string, body: Uint8Array = new Uint8Array([1, 2, 3])): Response | Promise<Response> {
    return send('/report-photo', { method: 'POST', headers: { 'content-type': mime }, body });
  }

  // PL: Uczeń bez roli wysyła JPEG: 200, a w bazie zdjęcie z jego numerem jako autorem.
  // EN: A student without a role sends a JPEG: 200, and the database has the photo with their id as the author.
  it('uczeń bez roli wysyła JPEG: 200 i autor z sesji / a student without a role sends a JPEG: 200 and the author from the session', async () => {
    const response = await report('image/jpeg');
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(200);
    const { id } = (await response.json()) as { id: string };
    expect(id).toEqual(expect.any(String));
    expect(rows).toEqual([expect.objectContaining({ id, kind: 'photo', mime: 'image/jpeg', uploadedBy: studentId })]);
  });

  // PL: HEIC odpada: 415 i nic nie zapisuje.
  // EN: HEIC is rejected: 415 and nothing is saved.
  it('HEIC odpada z 415 i nic nie zapisuje / HEIC is rejected with 415 and saves nothing', async () => {
    const response = await report('image/heic');
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(415);
    expect(rows).toHaveLength(0);
  });

  // PL: Plik większy od limitu zdjęcia odpada: 413 i nic nie zostaje w bazie.
  // EN: A file bigger than the photo limit is rejected: 413 and nothing stays in the database.
  it('za duży plik odpada z 413 i nic nie zostaje / a file that is too big is rejected with 413 and nothing stays', async () => {
    const response = await report('image/jpeg', new Uint8Array(MAX_PHOTO_BYTES + 1));
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(413);
    expect(rows).toHaveLength(0);
  });

  // PL: Bez sesji 401 i nic nie zapisane.
  // EN: Without a session 401 and nothing saved.
  it('bez sesji daje 401 i nic nie zapisuje / without a session gives 401 and saves nothing', async () => {
    const response = await send('/report-photo', { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: new Uint8Array([1]) }, false);
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(response.status).toBe(401);
    expect(rows).toHaveLength(0);
  });
});
