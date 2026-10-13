/**
 * PL: Test routera panelu na prawdziwej bazie D1 i prawdziwym logowaniu kodem z drzwi modułu auth. Sprawdza GET /me (401 bez sesji, poziom z bazy, także administrator), GET /invites (401 bez sesji, 403 dla ucznia i redakcji, pusta lista i lista z wydanym kodem) oraz POST /invites (201 dla Samorządu i kod, który naprawdę trafia do bazy).
 * EN: Test of the panel router on a real D1 database and the real code sign-in from the auth module door. Checks GET /me (401 without a session, the level from the database, administrator included), GET /invites (401 without a session, 403 for a student and the editorial team, an empty list and a list with an issued code) and POST /invites (201 for the Council and a code that really lands in the database).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/admin/testSession.ts::setUpPanel
 * @uses worker/admin/testSession.ts::callAdmin
 * @uses worker/db/schema/auth.ts::verification
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Tabela zaproszeń (leży w verification), żeby sprawdzić, że kod jest w bazie.
// EN: The invitations table (it lives in verification), to check that the code is in the database.
import { eq } from 'drizzle-orm';
import { verification } from '../db/schema/auth';
// PL: Wspólne narzędzia testów panelu.
// EN: The shared panel test tools.
import { callAdmin, db, setUpPanel, type Who } from './testSession';

// PL: Ciasteczka kont z tego pliku, ustawiane przed każdym testem.
// EN: The cookies of the accounts in this file, set before every test.
let cookies: Record<Who, string>;

beforeEach(async () => {
  cookies = await setUpPanel();
});

// PL: Grupa testów adresu /me.
// EN: A group of tests for the /me route.
describe('GET /me', () => {
  it('bez sesji odpowiada 401 / answers 401 without a session', async () => {
    expect((await callAdmin('/me', 'GET', null)).status).toBe(401);
  });

  it('uczeń bez roli dostaje null, a z rolą jej poziom / a student without a role gets null, with a role its level', async () => {
    expect(await (await callAdmin('/me', 'GET', cookies.plain)).json()).toEqual({ level: null });
    expect(await (await callAdmin('/me', 'GET', cookies.editor)).json()).toEqual({ level: 'editor' });
    expect(await (await callAdmin('/me', 'GET', cookies.council)).json()).toEqual({ level: 'council' });
    expect(await (await callAdmin('/me', 'GET', cookies.admin)).json()).toEqual({ level: 'admin' });
  });
});

// PL: Grupa testów listy kodów.
// EN: A group of tests for the list of codes.
describe('GET /invites', () => {
  it('bez sesji 401, dla ucznia i redakcji 403 / 401 without a session, 403 for a student and the editorial team', async () => {
    expect((await callAdmin('/invites', 'GET', null)).status).toBe(401);
    expect((await callAdmin('/invites', 'GET', cookies.plain)).status).toBe(403);
    expect((await callAdmin('/invites', 'GET', cookies.editor)).status).toBe(403);
  });

  it('bez wydanych kodów lista jest pusta / with no codes issued the list is empty', async () => {
    const response = await callAdmin('/invites', 'GET', cookies.council);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ codes: [] });
  });

  it('pokazuje kod wydany przez Samorząd razem z końcem ważności / shows the code issued by the Council together with its expiry', async () => {
    // PL: Najpierw wydaj kod, potem sprawdź, że jest na liście.
    // EN: First issue a code, then check that it is on the list.
    const issued = (await (await callAdmin('/invites', 'POST', cookies.council)).json()) as { code: string; expiresAt: string };
    const body = (await (await callAdmin('/invites', 'GET', cookies.council)).json()) as { codes: { code: string; expiresAt: string }[] };
    expect(body.codes).toEqual([{ code: issued.code, expiresAt: issued.expiresAt }]);
  });

  it('administrator też widzi listę / the administrator sees the list too', async () => {
    expect((await callAdmin('/invites', 'GET', cookies.admin)).status).toBe(200);
  });
});

// PL: Grupa testów wydawania kodów.
// EN: A group of tests for issuing codes.
describe('POST /invites', () => {
  it('bez sesji 401, bez roli i dla redakcji 403 / 401 without a session, 403 without a role and for the editorial team', async () => {
    expect((await callAdmin('/invites', 'POST', null)).status).toBe(401);
    expect((await callAdmin('/invites', 'POST', cookies.plain)).status).toBe(403);
    expect((await callAdmin('/invites', 'POST', cookies.editor)).status).toBe(403);
  });

  it('Samorząd dostaje kod ważny 14 dni, który jest w bazie / the Council gets a code valid for 14 days that is in the database', async () => {
    const response = await callAdmin('/invites', 'POST', cookies.council);
    const body = (await response.json()) as { code: string; expiresAt: string };

    // PL: Kod ma kształt „TEB-XXXX-XX”, a koniec ważności jest za 14 dni (z minutą zapasu).
    // EN: The code has the shape "TEB-XXXX-XX" and the expiry is in 14 days (with a minute of margin).
    expect(response.status).toBe(201);
    expect(body.code).toMatch(/^TEB-[A-Z0-9]{4}-[A-Z0-9]{2}$/);
    expect(Math.abs(Date.parse(body.expiresAt) - (Date.now() + 14 * 24 * 60 * 60 * 1000))).toBeLessThan(60_000);
    // PL: Kod naprawdę leży w bazie jako wiersz zaproszenia.
    // EN: The code really lies in the database as an invitation row.
    const rows = await db.select().from(verification).where(eq(verification.identifier, `invite-code-${body.code}`));
    expect(rows).toHaveLength(1);
  });
});
