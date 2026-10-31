/**
 * PL: Zapis wysłanego pliku: najpierw sprawdza rozmiar treści, a dopiero potem wkłada plik do zasobnika R2 i dopisuje wiersz do bazy. Plik za duży odpada przed R2, więc w zasobniku nic nie powstaje.
 * EN: Saves an uploaded file: first it checks the size of the body, and only then puts the file into the R2 bucket and adds a row to the database. A file that is too big is refused before R2, so nothing is created in the bucket.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/media.ts::mediaFiles
 * @used_by worker/media/routes.ts::mediaApp
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
 * PL: Zapisuje plik w R2 i w bazie. Najpierw kontrola rozmiaru treści, która zawsze działa, bo bierze prawdziwą długość bajtów, a nie nagłówek. Dopiero potem zapis do R2 i wiersz w bazie. Gdy zapis wiersza się nie uda, plik w R2 też jest kasowany.
 * EN: Saves the file to R2 and the database. First the size check on the body, which always works, because it takes the real byte length and not the header. Only then the write to R2 and the database row. When writing the row fails, the file in R2 is deleted too.
 *
 * @param input - PL: dane pliku i dostęp do R2 oraz D1. EN: the file data and access to R2 and D1.
 * @returns PL: numer pliku albo odmowa. EN: the file id or a refusal.
 */
export async function storeMedia(input: StoreMediaInput): Promise<StoreMediaResult> {
  // PL: Za duży plik odpada przed zapisem do R2, więc nic tam nie trafia.
  // EN: A file that is too big is refused before the write to R2, so nothing reaches it.
  if (input.body.byteLength > input.maxBytes) return { ok: false, reason: 'too-large' };

  // PL: Numer pliku jest też kluczem w R2.
  // EN: The file id is also the key in R2.
  const id = crypto.randomUUID();
  const object = await input.bucket.put(id, input.body, { httpMetadata: { contentType: input.mime } });
  if (!object) throw new Error('R2 nie zapisał pliku bez warunków');
  try {
    await drizzle(input.db)
      .insert(mediaFiles)
      .values({
        id,
        kind: input.kind,
        mime: input.mime,
        size: input.body.byteLength,
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
