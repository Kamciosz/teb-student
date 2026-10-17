/**
 * PL: Test wyglądu: motyw (auto, jasny, ciemny) i szkoła zapisują się w pamięci, ustawiają atrybuty na <html> i wracają po restarcie. Stary zapis z paletą wczytuje się jako motyw automatyczny, a zablokowana pamięć nie psuje zmiany wyglądu.
 * EN: Test of the look: the theme (auto, light, dark) and the school are saved in the storage, set the attributes on <html> and come back after a restart. An old palette record loads as the automatic theme, and a blocked storage does not break the look change.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/look.ts::applyLook
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Funkcje wyglądu i stałe, które testujemy.
// EN: The look functions and constants under test.
import {
  DEFAULT_LOOK,
  LOOK_STORAGE_KEY,
  applySchool,
  applyStoredLook,
  applyTheme,
  applyLook,
  currentLook,
  readStoredLook,
  resetLook,
  type LookStorage,
  type LookTarget,
} from './look';

// PL: Zwykły obiekt zamiast <html>: testy działają w Workerze bez przeglądarki.
// EN: A plain object instead of <html>: the tests run in a Worker without a browser.
function fakeTarget(): LookTarget & { dataset: Record<string, string> } {
  return { dataset: {} };
}

// PL: Pamięć w pamięci procesu z dostępem do surowego zapisu, żeby sprawdzić, co trafiło do klucza.
// EN: In-memory storage with access to the raw record, so we can check what reached the key.
function memoryStorage(): LookStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

// PL: Pamięć zablokowana przez przeglądarkę: każde wywołanie rzuca błąd.
// EN: Storage blocked by the browser: every call throws.
function blockedStorage(): LookStorage {
  const blocked = () => {
    throw new Error('pamięć zablokowana');
  };
  return { getItem: blocked, setItem: blocked, removeItem: blocked };
}

describe('wygląd / the look', () => {
  let target: ReturnType<typeof fakeTarget>;
  let storage: ReturnType<typeof memoryStorage>;

  beforeEach(() => {
    target = fakeTarget();
    storage = memoryStorage();
  });

  it('jasny motyw i technikum ustawiają atrybuty i zapisują wybór / the light theme and the technical school set the attributes and save the choice', () => {
    applyLook({ theme: 'jasny', school: 'T' }, target, storage);

    expect(target.dataset).toEqual({ motyw: 'jasny', szkola: 'T' });
    expect(JSON.parse(storage.data.get(LOOK_STORAGE_KEY) ?? 'null')).toEqual({ theme: 'jasny', school: 'T' });
  });

  it('motyw automatyczny usuwa atrybut motywu, żeby działał motyw telefonu / the automatic theme removes the theme attribute, so the phone theme applies', () => {
    applyLook({ theme: 'ciemny', school: 'L' }, target, storage);
    applyLook({ theme: 'auto', school: 'L' }, target, storage);

    expect(target.dataset).toEqual({ szkola: 'L' });
  });

  it('zapis z zablokowaną pamięcią nie rzuca błędu i wygląd i tak działa / a save with blocked storage throws nothing, and the look still works', () => {
    expect(() => applyLook({ theme: 'ciemny', school: 'T' }, target, blockedStorage())).not.toThrow();
    expect(target.dataset).toEqual({ motyw: 'ciemny', szkola: 'T' });
  });

  it('przy starcie bez zapisu ustawia wygląd domyślny / at start without a record it sets the default look', () => {
    applyStoredLook(target, storage);

    expect(target.dataset).toEqual({ szkola: DEFAULT_LOOK.school });
    expect(DEFAULT_LOOK).toEqual({ theme: 'auto', school: 'L' });
  });

  it('przy starcie wczytuje zapisany motyw i szkołę po restarcie / at start it loads the saved theme and school after a restart', () => {
    applyLook({ theme: 'ciemny', school: 'T' }, fakeTarget(), storage);

    const afterRestart = fakeTarget();
    applyStoredLook(afterRestart, storage);

    expect(afterRestart.dataset).toEqual({ motyw: 'ciemny', szkola: 'T' });
  });

  it('zepsuty zapis to brak zapisu / a broken record counts as no record', () => {
    storage.data.set(LOOK_STORAGE_KEY, '{nie json');

    expect(readStoredLook(storage)).toBeUndefined();
  });

  it('zapis bez poprawnej szkoły to brak zapisu / a record without a valid school counts as no record', () => {
    storage.data.set(LOOK_STORAGE_KEY, JSON.stringify({ theme: 'ciemny', school: 'X' }));

    expect(readStoredLook(storage)).toBeUndefined();
  });

  it('stary zapis z paletą wczytuje się jako motyw automatyczny i szkoła / an old palette record loads as the automatic theme and the school', () => {
    storage.data.set(LOOK_STORAGE_KEY, JSON.stringify({ palette: 'CZ', school: 'T' }));

    expect(readStoredLook(storage)).toEqual({ theme: 'auto', school: 'T' });
  });

  it('nieznany motyw w zapisie idzie na automatyczny / an unknown theme in the record becomes automatic', () => {
    storage.data.set(LOOK_STORAGE_KEY, JSON.stringify({ theme: 'fioletowy', school: 'L' }));

    expect(readStoredLook(storage)).toEqual({ theme: 'auto', school: 'L' });
  });

  it('zmiana szkoły z serwera zostawia motyw ustawiony na telefonie / a school change from the server keeps the theme set on the phone', () => {
    applyTheme('ciemny', target, storage);
    applySchool('T', target, storage);

    expect(target.dataset).toEqual({ motyw: 'ciemny', szkola: 'T' });
    expect(JSON.parse(storage.data.get(LOOK_STORAGE_KEY) ?? 'null')).toEqual({ theme: 'ciemny', school: 'T' });
  });

  it('zmiana motywu zostawia szkołę, która jest na stronie / a theme change keeps the school that is on the page', () => {
    applySchool('T', target, storage);
    applyTheme('jasny', target, storage);

    expect(target.dataset).toEqual({ motyw: 'jasny', szkola: 'T' });
    expect(JSON.parse(storage.data.get(LOOK_STORAGE_KEY) ?? 'null')).toEqual({ theme: 'jasny', school: 'T' });
  });

  it('currentLook czyta wygląd z atrybutów, a brak lub zły atrybut to motyw auto i liceum / currentLook reads the look from the attributes, and a missing or wrong attribute means auto and lyceum', () => {
    expect(currentLook(target)).toEqual({ theme: 'auto', school: 'L' });

    target.dataset.motyw = 'ciemny';
    target.dataset.szkola = 'T';
    expect(currentLook(target)).toEqual({ theme: 'ciemny', school: 'T' });

    target.dataset.szkola = 'X';
    expect(currentLook(target)).toEqual({ theme: 'ciemny', school: 'L' });
  });

  it('resetLook kasuje zapis i wraca do wyglądu domyślnego / resetLook deletes the record and goes back to the default look', () => {
    applyLook({ theme: 'ciemny', school: 'T' }, target, storage);
    resetLook(target, storage);

    expect(storage.data.has(LOOK_STORAGE_KEY)).toBe(false);
    expect(target.dataset).toEqual({ szkola: 'L' });
  });

  it('resetLook z zablokowaną pamięcią nie rzuca błędu / resetLook with blocked storage throws nothing', () => {
    expect(() => resetLook(target, blockedStorage())).not.toThrow();
    expect(target.dataset).toEqual({ szkola: 'L' });
  });
});
