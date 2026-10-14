/**
 * PL: Test funkcji findMediaOwner na prawdziwej bazie D1 z testowego Workera. Sprawdza trzy przypadki: plik ucznia (jego numer), plik bez autora (null) i brak pliku (undefined).
 * EN: Test of the findMediaOwner function on a real D1 database of the test Worker. Checks three cases: a student's file (their id), a file without an author (null), and no file (undefined).
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/media/index.ts::findMediaOwner
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do przygotowania danych.
// EN: The database client to prepare the data.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcja sprawdzana przez drzwi modułu, i tabela plików.
// EN: The function checked through the module door, and the files table.
import { findMediaOwner } from './index';
import { mediaFiles } from '../db/schema/media';

// PL: Przed każdym testem: plik ucznia i plik bez autora.
// EN: Before every test: a student's file and a file without an author.
beforeEach(async () => {
  const db = drizzle(env.DB);
  await db.delete(mediaFiles);
  await db.insert(mediaFiles).values([
    { id: 'test-wlasny', kind: 'photo', mime: 'image/jpeg', size: 10, width: null, height: null, uploadedBy: 'test-uczen', createdAt: 1 },
    { id: 'test-bez-autora', kind: 'photo', mime: 'image/jpeg', size: 10, width: null, height: null, uploadedBy: null, createdAt: 2 },
  ]);
});

// PL: Grupa testów autora pliku.
// EN: A group of tests for the author of a file.
describe('findMediaOwner', () => {
  // PL: Plik ucznia zwraca jego numer.
  // EN: A student's file returns their id.
  it('plik ucznia zwraca jego numer / a student file returns their id', async () => {
    expect(await findMediaOwner(env.DB, 'test-wlasny')).toBe('test-uczen');
  });

  // PL: Plik bez autora zwraca null.
  // EN: A file without an author returns null.
  it('plik bez autora zwraca null / a file without an author returns null', async () => {
    expect(await findMediaOwner(env.DB, 'test-bez-autora')).toBeNull();
  });

  // PL: Brak pliku zwraca undefined.
  // EN: No file returns undefined.
  it('brak pliku zwraca undefined / no file returns undefined', async () => {
    expect(await findMediaOwner(env.DB, 'test-nie-ma')).toBeUndefined();
  });
});
