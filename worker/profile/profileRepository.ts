/**
 * PL: Zapis i odczyt profilu ucznia w bazie D1. Każde zapytanie ma warunek po numerze ucznia, więc uczeń widzi i zmienia tylko swój profil.
 * EN: Saving and reading the student's profile in the D1 database. Every query has a condition on the student id, so a student sees and changes only their own profile.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/db/schema/profile.ts::profiles
 * @uses worker/profile/validation.ts::ProfileInput
 * @used_by worker/profile/routes.ts::profileApp
 * @used_by worker/profile/profile.test.ts::saveProfile
 */

// PL: Warunek równości i Drizzle dla D1.
// EN: The equality condition and Drizzle for D1.
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela profili.
// EN: The profiles table.
import { profiles } from '../db/schema/profile';
// PL: Typ profilu.
// EN: The profile type.
import type { ProfileInput } from './validation';

/**
 * PL: Profil, który widzi uczeń, gdy jeszcze niczego nie zapisał: puste imię i klasa oraz domyślny wygląd (liceum, paleta CE, jak w src/shared/styles/tokens.css).
 * EN: The profile a student sees before saving anything: an empty name and class and the default look (lyceum, palette CE, as in src/shared/styles/tokens.css).
 */
export const DEFAULT_PROFILE: ProfileInput = { name: '', className: '', school: 'L', palette: 'CE' };

/**
 * PL: Czyta profil ucznia.
 * EN: Reads the student's profile.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer ucznia z sesji. EN: the student id from the session.
 * @returns PL: zapisany profil albo profil domyślny, gdy uczeń niczego nie zapisał. EN: the saved profile or the default one when the student saved nothing.
 */
export async function getProfile(db: D1Database, userId: string): Promise<ProfileInput> {
  // PL: Wybierz tylko pola profilu, bez numeru ucznia i czasu zapisu.
  // EN: Select only the profile fields, without the student id and the save time.
  const [row] = await drizzle(db)
    .select({ name: profiles.name, className: profiles.className, school: profiles.school, palette: profiles.palette })
    .from(profiles)
    .where(eq(profiles.userId, userId));
  return row ?? DEFAULT_PROFILE;
}

/**
 * PL: Zapisuje profil ucznia: pierwszy zapis dodaje wiersz, kolejne go nadpisują.
 * EN: Saves the student's profile: the first save adds a row, later ones overwrite it.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer ucznia z sesji. EN: the student id from the session.
 * @param input - PL: sprawdzony profil. EN: the validated profile.
 * @throws PL: przy błędzie bazy. EN: on a database error.
 */
export async function saveProfile(db: D1Database, userId: string, input: ProfileInput): Promise<void> {
  // PL: Czas zapisu w milisekundach.
  // EN: The save time in milliseconds.
  const row = { userId, ...input, updatedAt: Date.now() };
  // PL: Wstaw wiersz, a gdy uczeń ma już profil, nadpisz jego pola.
  // EN: Insert the row, and when the student already has a profile, overwrite its fields.
  await drizzle(db).insert(profiles).values(row).onConflictDoUpdate({ target: profiles.userId, set: row });
}
