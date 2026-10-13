/**
 * PL: Zapis wysłanego pliku: wkłada go do zasobnika R2, sprawdza rozmiar po zapisie i dopiero wtedy dopisuje wiersz do bazy. Plik za duży zostaje skasowany, więc w zasobniku nic nie zostaje.
 * EN: Saves an uploaded file: puts it into the R2 bucket, checks the size after saving, and only then adds a row to the database. A file that is too big is deleted, so nothing stays in the bucket.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/media.ts::mediaFiles
 * @uses worker/media/rules.ts::maxBytesOf
 * @used_by worker/media/routes.ts::mediaApp
 */

// PL: Funkcje Drizzle dla bazy D1 (SQLite).
// EN: Drizzle functions for the D1 (SQLite) database.
import { drizzle } from 'drizzle-orm/d1';
import { type MediaKind, mediaFiles } from '../db/schema/media';

/** PL: Dane wejściowe zapisu pliku. EN: The input of saving a file. */
export type StoreMediaInput = {
  /** PL: Zasobnik R2 (env.MEDIA). EN: The R2 bucket (env.MEDIA). */
  bucket: R2Bucket;
  /** PL: Baza D1 (env.DB). EN: The D1 database (env.DB). */
  db: D1Database;
  /** PL: Treść pliku. EN: The file content. */
  body: ArrayBuffer;
  /** PL: Typ zawartości, np. image/jpeg. EN: The content type, for example image/jpeg. */
  mime: string;
  /** PL: Rodzaj pliku: zdjęcie albo film. EN: The file kind: a photo or a video. */
  kind: MediaKind;
  /** PL: Szerokość w pikselach albo null. EN: The width in pixels, or null. */
  width: number | null;
  /** PL: Wysokość w pikselach albo null. EN: The height in pixels, or null. */
  height: number | null;
  /** PL: Numer konta, które wysyła plik. EN: The id of the account that uploads the file. */
  uploadedBy: string;
  /** PL: Najwięcej bajtów dla tego pliku. EN: The most bytes for this file. */
  maxBytes: number;
};

/**
 * PL: Wynik zapisu: numer pliku, albo odmowa, gdy plik jest za duży.
 * EN: The result of saving: the file id, or a refusal when the file is too big.
 */
export type StoreMediaResult = { ok: true; id: string } | { ok: false; reason: 'too-large' };

/**
 * PL: Zapisuje plik w R2 i w bazie. Najpierw zapis do R2, potem kontrola rozmiaru z obiektu (po zapisie, bo rozmiar bierzemy z tego, co R2 faktycznie przyjęło), a wiersz w bazie tylko dla pliku, który przeszedł kontrolę. Gdy zapis wiersza się nie uda, plik w R2 też jest kasowany.
 * EN: Saves the file to R2 and the database. First the write to R2, then the size check on the object (after the write, because the size is taken from what R2 actually stored), and the database row only for a file that passed the check. When writing the row fails, the file in R2 is deleted too.
 *
 * @param input - PL: dane pliku i dostęp do R2 oraz D1. EN: the file data and access to R2 and D1.
 * @returns PL: numer pliku albo odmowa. EN: the file id or a refusal.
 */
export async function storeMedia(input: StoreMediaInput): Promise<StoreMediaResult> {
  // PL: Numer pliku jest też kluczem w R2.
  // EN: The file id is also the key in R2.
  const id = crypto.randomUUID();
  const object = await input.bucket.put(id, input.body, { httpMetadata: { contentType: input.mime } });
  if (!object) throw new Error('R2 nie zapisał pliku bez warunków');
  // PL: Plik za duży kasujemy od razu, żeby nie zostawał w zasobniku.
  // EN: A file that is too big is deleted at once, so it does not stay in the bucket.
  if (object.size > input.maxBytes) {
    await input.bucket.delete(id);
    return { ok: false, reason: 'too-large' };
  }
  try {
    await drizzle(input.db)
      .insert(mediaFiles)
      .values({
        id,
        kind: input.kind,
        mime: input.mime,
        size: object.size,
        width: input.width,
        height: input.height,
        uploadedBy: input.uploadedBy,
        createdAt: Date.now(),
      });
  } catch (error) {
    // PL: Bez wiersza plik w R2 byłby sierotą, więc go kasujemy i zgłaszamy błąd dalej.
    // EN: Without a row the file in R2 would be an orphan, so we delete it and pass the error on.
    await input.bucket.delete(id);
    throw error;
  }
  return { ok: true, id };
}
