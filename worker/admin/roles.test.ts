/**
 * PL: Test ról w panelu na prawdziwej bazie D1. Sprawdza, że administrator nadaje i odbiera rolę Samorządu i redakcji, że Samorząd i uczeń dostają 403, że szukanie i lista pokazują tylko zamaskowany adres oraz że rola administratora się nie zmienia.
 * EN: Test of roles in the panel on a real D1 database. Checks that the administrator grants and revokes the Council and editorial roles, that the Council and a student get 403, that search and the list show only a masked address, and that the administrator role does not change.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/admin/testSession.ts::setUpPanel
 * @uses worker/admin/testSession.ts::callAdmin
 * @uses worker/admin/testSession.ts::rolesOf
 * @uses worker/admin/testSession.ts::studentId
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera (baza D1), żeby założyć trigger blokujący dziennik.
// EN: The Worker test environment (the D1 database), to create the trigger that blocks the diary.
import { env } from 'cloudflare:workers';
// PL: Wspólne narzędzia testów panelu i adresy kont.
// EN: The shared panel test tools and the account addresses.
import { EMAILS, callAdmin, rolesOf, setUpPanel, studentId, type Who } from './testSession';

// PL: Ciasteczka kont z tego pliku, ustawiane przed każdym testem.
// EN: The cookies of the accounts in this file, set before every test.
let cookies: Record<Who, string>;

beforeEach(async () => {
  cookies = await setUpPanel();
});

// PL: Grupa testów nadawania roli.
// EN: A group of tests for granting a role.
describe('PUT /roles/:studentId', () => {
  it('administrator nadaje rolę Samorządu i zapisuje ją w bazie / the administrator grants the Council role and it is saved in the database', async () => {
    const response = await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', cookies.admin, { council: true, editor: false });
    expect(response.status).toBe(200);
    expect(await rolesOf(EMAILS.plain)).toEqual(['council']);
  });

  it('administrator odbiera obie role, gdy oba przełączniki są wyłączone / the administrator revokes both roles when both switches are off', async () => {
    const response = await callAdmin(`/roles/${await studentId(EMAILS.editor)}`, 'PUT', cookies.admin, { council: false, editor: false });
    expect(response.status).toBe(200);
    expect(await rolesOf(EMAILS.editor)).toEqual([]);
  });

  it('nie rusza roli administratora / does not touch the administrator role', async () => {
    await callAdmin(`/roles/${await studentId(EMAILS.admin)}`, 'PUT', cookies.admin, { council: false, editor: false });
    expect(await rolesOf(EMAILS.admin)).toEqual(['admin']);
  });
});

// PL: Zmiana roli zostawia jeden wpis w dzienniku, a powtórny zapis tego samego już nic nie dopisuje.
// EN: A role change leaves one diary entry, and saving the same thing again adds nothing.
describe('PUT /roles/:studentId, wpis w dzienniku', () => {
  it('nadanie roli dopisuje jeden wpis, a powtórka nie / granting a role adds one entry, and a repeat adds none', async () => {
    const id = await studentId(EMAILS.plain);
    await callAdmin(`/roles/${id}`, 'PUT', cookies.admin, { council: true, editor: false });
    await callAdmin(`/roles/${id}`, 'PUT', cookies.admin, { council: true, editor: false });

    const entries = await env.DB.prepare('SELECT action, target_id AS targetId FROM diary_entries').all<{ action: string; targetId: string }>();
    expect(entries.results).toEqual([{ action: 'council_granted', targetId: id }]);
  });
});

// PL: Gdy zapis do dziennika się nie uda, rola też się nie zmienia: 500 i stan roli jak przed zmianą.
// EN: When the diary write fails, the role does not change either: 500 and the role stays as it was before.
describe('PUT /roles/:studentId, zapis do dziennika', () => {
  // PL: Trigger blokuje każdy zapis do dziennika. Usuwamy go w finally, żeby nie został dla kolejnych testów.
  // EN: The trigger blocks every diary write. We drop it in finally, so it does not stay for the next tests.
  const blockDiary = () => env.DB.prepare("CREATE TRIGGER blokada_dziennika BEFORE INSERT ON diary_entries BEGIN SELECT RAISE(ABORT, 'blokada dziennika'); END").run();
  const unblockDiary = () => env.DB.prepare('DROP TRIGGER IF EXISTS blokada_dziennika').run();
  const diaryCount = async () => (await env.DB.prepare('SELECT COUNT(*) AS n FROM diary_entries').first<{ n: number }>())?.n;

  it('gdy zapis do dziennika się nie uda, nadanie roli się cofa / when the diary write fails, granting the role is rolled back', async () => {
    await blockDiary();
    try {
      const response = await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', cookies.admin, { council: true, editor: false });

      expect(response.status).toBe(500);
      expect(await response.text()).not.toContain('blokada');
      expect(await rolesOf(EMAILS.plain)).toEqual([]);
      expect(await diaryCount()).toBe(0);
    } finally {
      await unblockDiary();
    }
  });

  it('gdy zapis do dziennika się nie uda, odebranie roli się cofa / when the diary write fails, revoking the role is rolled back', async () => {
    await blockDiary();
    try {
      const response = await callAdmin(`/roles/${await studentId(EMAILS.editor)}`, 'PUT', cookies.admin, { council: false, editor: false });

      expect(response.status).toBe(500);
      expect(await response.text()).not.toContain('blokada');
      expect(await rolesOf(EMAILS.editor)).toEqual(['editor']);
      expect(await diaryCount()).toBe(0);
    } finally {
      await unblockDiary();
    }
  });
});

// PL: Grupa testów odmów i błędów przy zapisie roli.
// EN: A group of tests for refusals and errors when saving a role.
describe('PUT /roles/:studentId, odmowy i błędy', () => {
  it('Samorząd dostaje 403 i nie zmienia ról / the Council gets 403 and does not change roles', async () => {
    const response = await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', cookies.council, { council: true, editor: true });
    expect(response.status).toBe(403);
    expect(await rolesOf(EMAILS.plain)).toEqual([]);
  });

  it('uczeń dostaje 403 i nie zmienia ról / a student gets 403 and does not change roles', async () => {
    const response = await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', cookies.plain, { council: true, editor: true });
    expect(response.status).toBe(403);
    expect(await rolesOf(EMAILS.plain)).toEqual([]);
  });

  it('bez sesji 401 / 401 without a session', async () => {
    expect((await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', null, { council: true, editor: false })).status).toBe(401);
  });

  it('zły zapis to 400 i nic się nie zmienia / a bad save is 400 and nothing changes', async () => {
    const response = await callAdmin(`/roles/${await studentId(EMAILS.plain)}`, 'PUT', cookies.admin, { council: 'tak', editor: false });
    expect(response.status).toBe(400);
    expect(await rolesOf(EMAILS.plain)).toEqual([]);
  });

  it('nieistniejący uczeń to 404 / an unknown student is 404', async () => {
    expect((await callAdmin('/roles/brak-takiego-ucznia', 'PUT', cookies.admin, { council: true, editor: false })).status).toBe(404);
  });
});

// PL: Grupa testów listy ról.
// EN: A group of tests for the list of roles.
describe('GET /roles', () => {
  it('Samorząd dostaje 403 / the Council gets 403', async () => {
    expect((await callAdmin('/roles', 'GET', cookies.council)).status).toBe(403);
  });

  it('administrator widzi osoby z rolą, bez administratora i bez pełnych adresów / the administrator sees the people with a role, without the administrator and without full addresses', async () => {
    const response = await callAdmin('/roles', 'GET', cookies.admin);
    const text = await response.text();
    const body = JSON.parse(text) as { holders: { maskedEmail: string; council: boolean; editor: boolean }[] };

    // PL: Na liście są redakcja i Samorząd, adresy są zamaskowane.
    // EN: The list has the editorial team and the Council, and the addresses are masked.
    // PL: Adresy redakcji i Samorządu maskują się tak samo, a administrator na liście nie jest.
    // EN: The editorial and Council addresses mask the same way, and the administrator is not on the list.
    expect(body.holders.map((holder) => holder.maskedEmail)).toEqual(['p***@teb.edu.pl', 'p***@teb.edu.pl']);
    expect(body.holders.some((holder) => holder.editor)).toBe(true);
    expect(body.holders.some((holder) => holder.council)).toBe(true);
    expect(text).not.toContain(EMAILS.editor);
    expect(text).not.toContain(EMAILS.council);
    expect(text).not.toContain(EMAILS.admin);
  });
});

// PL: Grupa testów szukania po adresie.
// EN: A group of tests for searching by address.
describe('GET /roles/search', () => {
  it('znajduje ucznia po szkolnym adresie i pokazuje tylko zamaskowany / finds a student by the school address and shows only the masked one', async () => {
    const response = await callAdmin(`/roles/search?email=${encodeURIComponent(EMAILS.plain)}`, 'GET', cookies.admin);
    const text = await response.text();

    // PL: Adres w odpowiedzi jest zamaskowany i nie ma w niej pełnego adresu.
    // EN: The address in the answer is masked and the full address is not in it.
    expect(response.status).toBe(200);
    expect(JSON.parse(text)).toMatchObject({ studentId: await studentId(EMAILS.plain), maskedEmail: 'p***@teb.edu.pl', council: false, editor: false });
    expect(text).not.toContain(EMAILS.plain);
  });

  it('nieznany adres to 404 / an unknown address is 404', async () => {
    const response = await callAdmin(`/roles/search?email=${encodeURIComponent('nikt@teb.edu.pl')}`, 'GET', cookies.admin);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });

  it('Samorząd dostaje 403 / the Council gets 403', async () => {
    expect((await callAdmin(`/roles/search?email=${encodeURIComponent(EMAILS.plain)}`, 'GET', cookies.council)).status).toBe(403);
  });
});
