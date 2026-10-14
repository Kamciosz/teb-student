/**
 * PL: Klucze dostępu ucznia po stronie serwera. Zamienia wiersz z Better Auth na bezpieczny kształt dla aplikacji (bez klucza publicznego i identyfikatora urządzenia) oraz podaje liczbę i nazwy kluczy do eksportu danych RODO.
 * EN: The student's passkeys on the server side. Turns a row from Better Auth into a safe shape for the app (without the public key and the device identifier) and gives the count and the names of the keys for the GDPR export.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/db/schema/auth.ts::passkey
 * @used_by worker/auth/email/routes.ts::createAuthEmailApp
 * @used_by worker/auth/email/index.ts::listPasskeysForExport
 */

// PL: Zapytania do D1 przez Drizzle.
// EN: Queries to D1 through Drizzle.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela kluczy dostępu.
// EN: The passkey table.
import { passkey } from '../../db/schema/auth';

/**
 * PL: Klucz dostępu tak, jak widzi go aplikacja. Nie zawiera klucza publicznego ani identyfikatora urządzenia.
 * EN: A passkey as the app sees it. It does not contain the public key or the device identifier.
 */
export type PasskeyView = {
  /** PL: Numer klucza, potrzebny do usunięcia. EN: The key id, needed for deletion. */
  id: string;
  /** PL: Nazwa nadana przez ucznia, albo null. EN: The name given by the student, or null. */
  name: string | null;
  /** PL: Typ urządzenia (pojedyncze albo wielokrotne). EN: The device type (single or multi-device). */
  deviceType: string;
  /** PL: Prawda, gdy klucz jest w chmurze producenta. EN: True when the key is in the manufacturer's cloud. */
  backedUp: boolean;
  /** PL: Kiedy klucz powstał (ISO), albo null. EN: When the key was created (ISO), or null. */
  createdAt: string | null;
};

/**
 * PL: Wiersz klucza, tak jak zwraca go Better Auth (w odpowiedzi JSON data jest tekstem).
 * EN: A key row as Better Auth returns it (in the JSON response the date is text).
 */
export type PasskeyRow = {
  /** PL: Numer klucza. EN: The key id. */
  id: string;
  /** PL: Nazwa klucza. EN: The key name. */
  name?: string | null;
  /** PL: Typ urządzenia. EN: The device type. */
  deviceType: string;
  /** PL: Czy klucz jest w chmurze producenta. EN: Whether the key is in the manufacturer's cloud. */
  backedUp: boolean;
  /** PL: Data utworzenia. EN: The creation date. */
  createdAt?: string | null;
};

/**
 * PL: Zamienia wiersz z Better Auth na kształt dla aplikacji. Klucz publiczny i identyfikator urządzenia nie przechodzą dalej.
 * EN: Turns a Better Auth row into the app's shape. The public key and the device identifier do not go further.
 *
 * @param row - PL: wiersz klucza z Better Auth. EN: the key row from Better Auth.
 * @returns PL: bezpieczny kształt klucza. EN: the safe shape of the key.
 */
export function toPasskeyView(row: PasskeyRow): PasskeyView {
  return {
    id: row.id,
    name: row.name ?? null,
    deviceType: row.deviceType,
    backedUp: row.backedUp,
    createdAt: row.createdAt ?? null,
  };
}

/**
 * PL: Podaje do eksportu RODO liczbę kluczy ucznia i ich nazwy. Nie zwraca kluczy kryptograficznych ani identyfikatorów urządzeń.
 * EN: Gives the student's key count and key names for the GDPR export. It does not return cryptographic keys or device identifiers.
 *
 * @param db - PL: baza D1 (env.DB). EN: the D1 database (env.DB).
 * @param userId - PL: numer ucznia. EN: the student id.
 * @returns PL: liczba kluczy i ich nazwy (null, gdy klucz nie ma nazwy). EN: the number of keys and their names (null when a key has no name).
 */
export async function listPasskeysForExport(db: D1Database, userId: string): Promise<{ count: number; names: (string | null)[] }> {
  const rows = await drizzle(db).select({ name: passkey.name }).from(passkey).where(eq(passkey.userId, userId));
  return { count: rows.length, names: rows.map((row) => row.name) };
}
