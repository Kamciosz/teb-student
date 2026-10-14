/**
 * PL: Test dziennika zmian na prawdziwej bazie D1. Sprawdza, że dziennik czyta tylko Samorząd i administrator, że wydanie kodu, zmiana roli i pobranie pliku zapisują wpis (a powtórny zapis tego samego nie dopisuje), że wpisy są od najnowszych, że strona ma po 50 wpisów i że zły numer strony daje 400.
 * EN: Test of the change diary on a real D1 database. Checks that only the Council and the administrator read the diary, that issuing a code, changing a role and downloading the file record an entry (and saving the same thing again adds nothing), that entries come newest first, that a page has 50 entries, and that a bad page number gives 400.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/admin/diary.ts::recordDiaryEntry
 * @uses worker/admin/diary.ts::PAGE_SIZE
 * @uses worker/admin/testSession.ts::setUpPanel
 * @uses worker/admin/testSession.ts::callAdmin
 * @uses worker/admin/testSession.ts::studentId
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Sortowanie odczytu tabeli dziennika w teście.
// EN: Ordering the read of the diary table in the test.
import { asc } from 'drizzle-orm';
// PL: Tabela dziennika, zapis wpisu i rozmiar strony.
// EN: The diary table, recording an entry and the page size.
import { diaryEntries } from '../db/schema/admin';
import { PAGE_SIZE, recordDiaryEntry } from './diary';
// PL: Wspólne narzędzia testów panelu i adresy kont.
// EN: The shared panel test tools and the account addresses.
import { EMAILS, callAdmin, db, setUpPanel, studentId, type Who } from './testSession';

// PL: Ciasteczka kont z tego pliku, ustawiane przed każdym testem.
// EN: The cookies of the accounts in this file, set before every test.
let cookies: Record<Who, string>;

// PL: Przed każdym testem zaloguj konta i wyczyść dziennik (robi to setUpPanel).
// EN: Before every test sign the accounts in and clear the diary (setUpPanel does it).
beforeEach(async () => {
  cookies = await setUpPanel();
});

/**
 * PL: Wszystkie wpisy dziennika od najstarszego, żeby łatwo sprawdzić kolejność zapisu.
 * EN: All the diary entries from the oldest, so the order of recording is easy to check.
 *
 * @returns PL: wiersze tabeli dziennika. EN: the rows of the diary table.
 */
async function allEntries() {
  return db.select().from(diaryEntries).orderBy(asc(diaryEntries.id));
}

// PL: Grupa testów odczytu dziennika.
// EN: A group of tests for reading the diary.
describe('GET /diary', () => {
  it('uczeń i redakcja dostają 403, a bez sesji 401 / a student and the editorial team get 403, and without a session 401', async () => {
    expect((await callAdmin('/diary', 'GET', null)).status).toBe(401);
    expect((await callAdmin('/diary', 'GET', cookies.plain)).status).toBe(403);
    expect((await callAdmin('/diary', 'GET', cookies.editor)).status).toBe(403);
  });

  it('Samorząd i administrator dostają 200 / the Council and the administrator get 200', async () => {
    expect((await callAdmin('/diary', 'GET', cookies.council)).status).toBe(200);
    expect((await callAdmin('/diary', 'GET', cookies.admin)).status).toBe(200);
  });

  it('pusty dziennik daje pustą listę / an empty diary gives an empty list', async () => {
    const response = await callAdmin('/diary', 'GET', cookies.council);
    expect(await response.json()).toEqual({ entries: [], hasNext: false });
  });

  it('zły numer strony daje 400 / a bad page number gives 400', async () => {
    expect((await callAdmin('/diary?page=0', 'GET', cookies.council)).status).toBe(400);
    expect((await callAdmin('/diary?page=abc', 'GET', cookies.council)).status).toBe(400);
  });

  it('wpisy są od najnowszych / the entries come newest first', async () => {
    // PL: Zapisz trzy wpisy w kolejności: pierwszy jest najstarszy.
    // EN: Record three entries in order: the first one is the oldest.
    const actorId = await studentId(EMAILS.council);
    await recordDiaryEntry(env.DB, { actorId, action: 'invite_issued', targetId: null });
    await recordDiaryEntry(env.DB, { actorId, action: 'editor_granted', targetId: null });
    await recordDiaryEntry(env.DB, { actorId, action: 'pilot_downloaded', targetId: null });

    const body = (await (await callAdmin('/diary', 'GET', cookies.council)).json()) as { entries: { action: string }[] };
    expect(body.entries.map((entry) => entry.action)).toEqual(['pilot_downloaded', 'editor_granted', 'invite_issued']);
  });

  it('strona ma po 50 wpisów i mówi, czy jest następna / a page has 50 entries and says whether there is a next one', async () => {
    // PL: Zapisz o jeden wpis więcej niż strona.
    // EN: Record one entry more than a page holds.
    const actorId = await studentId(EMAILS.council);
    for (let i = 0; i <= PAGE_SIZE; i++) {
      await recordDiaryEntry(env.DB, { actorId, action: 'invite_issued', targetId: null });
    }

    // PL: Pierwsza strona ma 50 wpisów i jest następna.
    // EN: The first page has 50 entries and there is a next one.
    const first = (await (await callAdmin('/diary?page=1', 'GET', cookies.council)).json()) as { entries: { id: number }[]; hasNext: boolean };
    expect(first.entries).toHaveLength(PAGE_SIZE);
    expect(first.hasNext).toBe(true);

    // PL: Druga strona ma jeden wpis, najstarszy, i nie ma następnej.
    // EN: The second page has one entry, the oldest, and there is no next one.
    const second = (await (await callAdmin('/diary?page=2', 'GET', cookies.council)).json()) as { entries: { id: number }[]; hasNext: boolean };
    expect(second.entries).toHaveLength(1);
    expect(second.hasNext).toBe(false);
    expect(second.entries[0].id).toBeLessThan(Math.min(...first.entries.map((entry) => entry.id)));
  });
});

// PL: Grupa testów, że akcje zapisują wpisy.
// EN: A group of tests that actions record entries.
describe('wpisy z akcji / entries from actions', () => {
  it('wydanie kodu zapisuje wpis bez kodu / issuing a code records an entry without the code', async () => {
    expect((await callAdmin('/invites', 'POST', cookies.council)).status).toBe(201);

    // PL: Jeden wpis: kto wydał, jaka akcja, bez numeru ucznia i bez kodu.
    // EN: One entry: who issued it, which action, without a student id and without the code.
    const rows = await allEntries();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actorId: await studentId(EMAILS.council), action: 'invite_issued', targetId: null });
  });

  it('uczeń nie wydaje kodu i nie ma wpisu / a student cannot issue a code and gets no entry', async () => {
    expect((await callAdmin('/invites', 'POST', cookies.plain)).status).toBe(403);
    expect(await allEntries()).toHaveLength(0);
  });

  it('zmiana roli zapisuje wpis, a powtórny zapis tego samego nie dopisuje / a role change records an entry, and saving the same thing again adds nothing', async () => {
    const plainId = await studentId(EMAILS.plain);

    // PL: Nadaj Samorząd, potem to samo jeszcze raz, a na końcu odbierz.
    // EN: Grant the Council, then the same again, and finally revoke.
    expect((await callAdmin(`/roles/${plainId}`, 'PUT', cookies.admin, { council: true, editor: false })).status).toBe(200);
    expect((await callAdmin(`/roles/${plainId}`, 'PUT', cookies.admin, { council: true, editor: false })).status).toBe(200);
    expect((await callAdmin(`/roles/${plainId}`, 'PUT', cookies.admin, { council: false, editor: false })).status).toBe(200);

    // PL: Dwa wpisy: nadanie i odebranie, a każdy o tym uczniu.
    // EN: Two entries: the grant and the revoke, each about this student.
    const rows = await allEntries();
    const adminId = await studentId(EMAILS.admin);
    expect(rows.map((row) => row.action)).toEqual(['council_granted', 'council_revoked']);
    expect(rows.every((row) => row.actorId === adminId && row.targetId === plainId)).toBe(true);
  });

  it('pobranie pliku z pilotażu zapisuje wpis / downloading the pilot file records an entry', async () => {
    expect((await callAdmin('/pilot', 'GET', cookies.admin)).status).toBe(200);

    const rows = await allEntries();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ actorId: await studentId(EMAILS.admin), action: 'pilot_downloaded', targetId: null });
  });
});
