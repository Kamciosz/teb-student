/**
 * PL: Testy logiki widoku panelu: wiersze widoczne dla każdej roli (macierz z ekranów 6.1b i 6.1c), podpisy ról, wiersz wejścia w profilu (6.1a), porównanie ról i data końca kodu.
 * EN: Tests of the panel view logic: the rows visible to each role (the matrix from screens 6.1b and 6.1c), the role captions, the profile entry row (6.1a), the role comparison and the code end date.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/panelView.ts::sectionsFor
 * @uses src/features/admin/panelView.ts::pilotSectionsFor
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { formatInviteEnd, isLevelEnough, panelEntryFor, pilotSectionsFor, roleCaption, sectionsFor } from './panelView';

// PL: Grupa testów wierszy ekranu głównego.
// EN: A group of tests for the main screen rows.
describe('sectionsFor', () => {
  it('redakcja widzi tylko Wpisy / the editorial team sees only Entries', () => {
    expect(sectionsFor('editor').map((section) => section.title)).toEqual(['Wpisy']);
  });

  it('Samorząd widzi cztery części w kolejności z projektu / the Council sees four sections in the design order', () => {
    expect(sectionsFor('council').map((section) => section.title)).toEqual(['Wpisy', 'Zgłoszenia', 'Ankiety', 'Kody zaproszeń']);
  });

  it('administrator widzi te cztery i „Role” z podpisem Administrator / the administrator sees those four and "Role" with the Administrator badge', () => {
    const rows = sectionsFor('admin');
    expect(rows.map((section) => section.title)).toEqual(['Wpisy', 'Zgłoszenia', 'Ankiety', 'Kody zaproszeń', 'Role']);
    expect(rows[4].badge).toBe('Administrator');
  });
});

// PL: Grupa testów wierszy pod etykietą „Pilotaż”.
// EN: A group of tests for the rows under the "Pilotaż" label.
describe('pilotSectionsFor', () => {
  it('tylko administrator widzi „Dane z pilotażu” / only the administrator sees "Dane z pilotażu"', () => {
    expect(pilotSectionsFor('admin').map((section) => section.title)).toEqual(['Dane z pilotażu']);
    expect(pilotSectionsFor('council')).toEqual([]);
    expect(pilotSectionsFor('editor')).toEqual([]);
  });
});

// PL: Grupa testów podpisów i wiersza wejścia.
// EN: A group of tests for the captions and the entry row.
describe('roleCaption i panelEntryFor / roleCaption and panelEntryFor', () => {
  it('podpisuje rolę tak jak projekt / captions the role as the design does', () => {
    expect(roleCaption('admin')).toBe('Twoja rola: administrator');
    expect(roleCaption('council')).toBe('Twoja rola: Samorząd');
    expect(roleCaption('editor')).toBe('Twoja rola: redakcja gazetki');
  });

  it('wiersz w profilu zależy od roli, a bez roli go nie ma / the profile row depends on the role and there is none without a role', () => {
    expect(panelEntryFor('council')).toEqual({ label: 'Panel Samorządu', badge: 'Samorząd' });
    expect(panelEntryFor('admin')).toEqual({ label: 'Panel Samorządu', badge: 'Administrator' });
    expect(panelEntryFor('editor')).toEqual({ label: 'Panel redakcji', badge: 'Redakcja' });
    expect(panelEntryFor(null)).toBeNull();
  });
});

// PL: Grupa testów porównania ról po stronie telefonu: te same reguły co na serwerze.
// EN: A group of tests for comparing roles on the phone side: the same rules as on the server.
describe('isLevelEnough', () => {
  it('rola wyższa wystarcza tam, gdzie niższa / a higher role is enough where a lower one is', () => {
    expect(isLevelEnough('editor', 'editor')).toBe(true);
    expect(isLevelEnough('editor', 'council')).toBe(false);
    expect(isLevelEnough('council', 'editor')).toBe(true);
    expect(isLevelEnough('council', 'admin')).toBe(false);
    expect(isLevelEnough('admin', 'council')).toBe(true);
  });
});

// PL: Grupa testów daty końca kodu.
// EN: A group of tests for the code end date.
describe('formatInviteEnd', () => {
  it('zapisuje dzień.miesiąc.rok z zerami / writes day.month.year with zeros', () => {
    expect(formatInviteEnd('2026-10-26T12:00:00.000Z')).toBe('26.10.2026');
    expect(formatInviteEnd('2026-01-05T12:00:00.000Z')).toBe('05.01.2026');
  });
});
