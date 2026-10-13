/**
 * PL: Schemat bazy modułu media (tabele Drizzle): zdjęcia i filmy wysłane przez redakcję. Plik zdjęcia trzyma zasobnik R2 (binding MEDIA), a tutaj jest jego opis: rodzaj, typ, rozmiar i wymiary. Schemat modułu należy do podtoru 2 (docs/PODZIAL_PRACY.md, część 2).
 * EN: The database schema of the media module (Drizzle tables): photos and videos uploaded by the editorial team. The file itself is kept in the R2 bucket (the MEDIA binding), and here is its description: kind, type, size and dimensions. The module schema belongs to subtrack 2 (docs/PODZIAL_PRACY.md, part 2).
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/media/upload.ts::mediaFiles
 * @used_by worker/media/routes.ts::mediaFiles
 * @used_by worker/media/deleteStudentData.ts::mediaFiles
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Rodzaj pliku: zdjęcie albo film. Kody są stałe i po angielsku.
 * EN: The kind of file: a photo or a video. The codes are stable and in English.
 */
export const MEDIA_KINDS = ['photo', 'video'] as const;

/** PL: Rodzaj pliku. EN: A file kind. */
export type MediaKind = (typeof MEDIA_KINDS)[number];

/**
 * PL: Plik zdjęcia albo filmu. Numer pliku jest też kluczem w zasobniku R2, więc adres pliku zawsze da się z niego złożyć.
 * EN: A photo or video file. The file id is also the key in the R2 bucket, so the file address can always be built from it.
 *
 * @invariant PL: `width` i `height` są albo oba liczbami całkowitymi dodatnimi, albo oba puste (gdy telefon nie zdołał odczytać zdjęcia, np. HEIC). EN: `width` and `height` are either both positive whole numbers, or both null (when the phone could not read the photo, for example HEIC).
 */
export const mediaFiles = sqliteTable('media_files', {
  /** PL: Numer pliku (UUID), jednocześnie klucz w zasobniku R2. EN: The file id (UUID), also the key in the R2 bucket. */
  id: text('id').primaryKey(),
  /** PL: Rodzaj pliku: zdjęcie albo film. EN: The kind of file: a photo or a video. */
  kind: text('kind', { enum: MEDIA_KINDS }).notNull(),
  /** PL: Typ zawartości, np. image/jpeg. EN: The content type, for example image/jpeg. */
  mime: text('mime').notNull(),
  /** PL: Rozmiar pliku w bajtach. EN: The file size in bytes. */
  size: integer('size').notNull(),
  /** PL: Szerokość w pikselach albo pusta, gdy nie znamy wymiarów. EN: The width in pixels, or null when the dimensions are unknown. */
  width: integer('width'),
  /** PL: Wysokość w pikselach albo pusta, gdy nie znamy wymiarów. EN: The height in pixels, or null when the dimensions are unknown. */
  height: integer('height'),
  /** PL: Numer konta, które wysłało plik, albo pusty po usunięciu konta. Bez klucza obcego, bo tabele kont należą do podtoru 1a. EN: The id of the account that uploaded the file, or null after the account is deleted. No foreign key, because the account tables belong to subtrack 1a. */
  uploadedBy: text('uploaded_by'),
  /** PL: Chwila wysłania, milisekundy od 1970. EN: When the file was uploaded, milliseconds since 1970. */
  createdAt: integer('created_at').notNull(),
});
