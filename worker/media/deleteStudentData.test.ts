/**
 * PL: Test funkcji deleteMediaStudentData na prawdziwej bazie D1 z testowego Workera. Sprawdza, że pliki ucznia zostają bez autora, a cudze i bez autora nie są ruszone.
 * EN: Test of the deleteMediaStudentData function on a real D1 database of the test Worker. Checks that the student's files stay without an author, and other people's and authorless files are untouched.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/media/deleteStudentData.ts::deleteMediaStudentData
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1 (binding DB, tabele ze schematu).
// EN: The Worker test environment with the D1 database (the DB binding, tables from the schema).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do przygotowania danych i odczytu wyniku.
// EN: The database client to prepare the data and read the result.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcja, którą sprawdzamy, i tabela plików.
// EN: The function under test, and the files table.
import { deleteMediaStudentData } from './deleteStudentData';
import { mediaFiles } from '../db/schema/media';

// PL: Przed każdym testem wpisujemy pliki: jeden ucznia, jeden cudzy i jeden bez autora.
// EN: Before every test we insert files: one of the student, one foreign and one without an author.
beforeEach(async () => {
  const db = drizzle(env.DB);
  await db.delete(mediaFiles);
  await db.insert(mediaFiles).values([
    { id: 'test-wlasny', kind: 'photo', mime: 'image/jpeg', size: 10, width: 1, height: 1, uploadedBy: 'test-uczen', createdAt: 1 },
    { id: 'test-cudzy', kind: 'video', mime: 'video/mp4', size: 20, width: null, height: null, uploadedBy: 'test-inny', createdAt: 2 },
    { id: 'test-bez-autora', kind: 'photo', mime: 'image/heic', size: 30, width: null, height: null, uploadedBy: null, createdAt: 3 },
  ]);
});

// PL: Grupa testów kasowania danych ucznia z modułu media.
// EN: A group of tests for deleting the student's data from the media module.
describe('deleteMediaStudentData', () => {
  // PL: Pliki ucznia zostają, ale bez autora; cudze i bez autora bez zmian.
  // EN: The student's files stay, but without an author; other people's and authorless ones are unchanged.
  it('zeruje autora plików ucznia i nie rusza cudzych / clears the author of the student files and leaves others', async () => {
    // PL: Usuń dane ucznia testowego.
    // EN: Delete the test student's data.
    const result = await deleteMediaStudentData({ userId: 'test-uczen', db: env.DB });

    // PL: Odczytaj autorów wszystkich plików, po numerze.
    // EN: Read the authors of all files, by id.
    const rows = await drizzle(env.DB)
      .select({ id: mediaFiles.id, uploadedBy: mediaFiles.uploadedBy })
      .from(mediaFiles)
      .orderBy(mediaFiles.id);

    // PL: Plik ucznia ma pusty autor, a pozostałe nie zmieniły się i nic nie zniknęło.
    // EN: The student's file has an empty author, the others did not change, and nothing disappeared.
    expect(result).toBeUndefined();
    expect(rows).toEqual([
      { id: 'test-bez-autora', uploadedBy: null },
      { id: 'test-cudzy', uploadedBy: 'test-inny' },
      { id: 'test-wlasny', uploadedBy: null },
    ]);
  });

  // PL: Uczeń bez plików to nie błąd.
  // EN: A student without files is not an error.
  it('nie psuje się dla ucznia bez plików / does not fail for a student without files', async () => {
    // PL: Usuń dane nieznanego ucznia.
    // EN: Delete the data of an unknown student.
    await expect(deleteMediaStudentData({ userId: 'nikt', db: env.DB })).resolves.toBeUndefined();
  });
});
