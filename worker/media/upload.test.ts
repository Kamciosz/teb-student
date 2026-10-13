/**
 * PL: Test funkcji storeMedia na prawdziwym zasobniku R2 i bazie D1 z testowego Workera. Sprawdza zapis poprawnego pliku oraz to, że plik za duży zostaje skasowany z R2 i nie trafia do bazy.
 * EN: Test of the storeMedia function on a real R2 bucket and D1 database of the test Worker. Checks saving a valid file, and that a file that is too big is deleted from R2 and does not reach the database.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/media/upload.ts::storeMedia
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z zasobnikiem R2 (MEDIA) i bazą D1 (DB).
// EN: The Worker test environment with the R2 bucket (MEDIA) and the D1 database (DB).
import { env } from 'cloudflare:workers';
// PL: Klient bazy do odczytu wierszy.
// EN: The database client to read the rows.
import { drizzle } from 'drizzle-orm/d1';
// PL: Funkcja, którą sprawdzamy, jej typ wejścia i tabela plików.
// EN: The function under test, its input type and the files table.
import { type StoreMediaInput, storeMedia } from './upload';
import { mediaFiles } from '../db/schema/media';

/** PL: Trzy bajty testowej treści. EN: Three bytes of test content. */
const BYTES = new Uint8Array([1, 2, 3]).buffer;

/**
 * PL: Dane zapisu zdjęcia z domyślnymi wartościami, które można nadpisać.
 * EN: The data of a photo save with default values, which can be overridden.
 *
 * @param overrides - PL: pola do nadpisania. EN: the fields to override.
 * @returns PL: pełne dane zapisu. EN: the full save data.
 */
function storeInput(overrides: Partial<StoreMediaInput> = {}): StoreMediaInput {
  return {
    bucket: env.MEDIA,
    db: env.DB,
    body: BYTES,
    mime: 'image/jpeg',
    kind: 'photo',
    width: 800,
    height: 600,
    uploadedBy: 'test-uczen',
    maxBytes: 1000,
    ...overrides,
  };
}

// PL: Przed każdym testem czyścimy bazę i zasobnik z plików poprzedniego testu.
// EN: Before every test we clean the database and the bucket of the previous test's files.
beforeEach(async () => {
  await drizzle(env.DB).delete(mediaFiles);
  const listed = await env.MEDIA.list();
  for (const object of listed.objects) await env.MEDIA.delete(object.key);
});

// PL: Grupa testów zapisu pliku.
// EN: A group of tests for saving a file.
describe('storeMedia', () => {
  // PL: Poprawny plik ląduje w R2 i ma wiersz z wymiarami.
  // EN: A valid file lands in R2 and has a row with the dimensions.
  it('zapisuje plik w R2 i wiersz w bazie / saves the file in R2 and the row in the database', async () => {
    // PL: Zapisz plik w granicach limitu.
    // EN: Save a file within the limit.
    const result = await storeMedia(storeInput());
    if (!result.ok) throw new Error('plik w granicach limitu został odrzucony');

    // PL: Plik jest w R2 pod numerem pliku, a w bazie jest jego opis.
    // EN: The file is in R2 under the file id, and its description is in the database.
    const object = await env.MEDIA.head(result.id);
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(object?.size).toBe(3);
    expect(rows).toEqual([
      { id: result.id, kind: 'photo', mime: 'image/jpeg', size: 3, width: 800, height: 600, uploadedBy: 'test-uczen', createdAt: expect.any(Number) },
    ]);
  });

  // PL: Plik za duży zostaje skasowany z R2 i nie trafia do bazy.
  // EN: A file that is too big is deleted from R2 and does not reach the database.
  it('kasuje za duży plik z R2 i nie zapisuje wiersza / deletes an oversized file from R2 and saves no row', async () => {
    // PL: Limit 2 bajty, a plik ma 3, więc jest za duży.
    // EN: The limit is 2 bytes and the file has 3, so it is too big.
    const result = await storeMedia(storeInput({ maxBytes: 2 }));

    // PL: Odmowa z powodem, zasobnik pusty, baza pusta.
    // EN: A refusal with the reason, an empty bucket, an empty database.
    const listed = await env.MEDIA.list();
    const rows = await drizzle(env.DB).select().from(mediaFiles);
    expect(result).toEqual({ ok: false, reason: 'too-large' });
    expect(listed.objects).toHaveLength(0);
    expect(rows).toHaveLength(0);
  });
});
