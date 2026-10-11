/**
 * PL: Schemat bazy modułu profile (tabele Drizzle): dane profilu ucznia, czyli imię, klasa, szkoła i wybrana paleta kolorów. Schemat modułu należy do podtoru 7 (docs/PODZIAL_PRACY.md, część 2). Imienia nie trzymamy w tabeli kont (auth), bo ta tabela należy do podtoru 1a.
 * EN: The database schema of the profile module (Drizzle tables): the student's profile data, that is the name, class, school and the chosen color palette. The module schema belongs to subtrack 7 (docs/PODZIAL_PRACY.md, part 2). The name is not kept in the accounts table (auth), because that table belongs to subtrack 1a.
 *
 * @author Jakub
 * @since 2026-10-11
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/profile/profileRepository.ts::profiles
 * @used_by worker/profile/deleteStudentData.ts::profiles
 * @used_by worker/profile/validation.ts::PROFILE_SCHOOLS
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Szkoły do wyboru: L to liceum (niebieski akcent), T to technikum (czerwony akcent). Kody są takie same jak wartości atrybutu data-szkola w src/shared/styles/tokens.css.
 * EN: The schools to choose from: L is the lyceum (blue accent), T is the technical school (red accent). The codes equal the values of the data-szkola attribute in src/shared/styles/tokens.css.
 */
export const PROFILE_SCHOOLS = ['L', 'T'] as const;

/**
 * PL: Osiem palet kolorów. Kody są takie same jak wartości atrybutu data-paleta w src/shared/styles/tokens.css.
 * EN: The eight color palettes. The codes equal the values of the data-paleta attribute in src/shared/styles/tokens.css.
 */
export const PROFILE_PALETTES = ['CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH'] as const;

/** PL: Kod szkoły (L albo T). EN: A school code (L or T). */
export type ProfileSchool = (typeof PROFILE_SCHOOLS)[number];

/** PL: Kod palety (CA do CH). EN: A palette code (CA to CH). */
export type ProfilePalette = (typeof PROFILE_PALETTES)[number];

/**
 * PL: Profil ucznia: jeden wiersz na ucznia. Wiersz powstaje przy pierwszym zapisie profilu, a znika przy usunięciu konta.
 * EN: A student's profile: one row per student. The row appears at the first save of the profile and disappears when the account is deleted.
 */
export const profiles = sqliteTable('profiles', {
  /** PL: Numer ucznia (konta). Zwykły tekst bez klucza obcego, jak reports.authorId: kasuje go deleteProfileStudentData. EN: The student (account) id. Plain text with no foreign key, like reports.authorId: deleteProfileStudentData deletes it. */
  userId: text('user_id').primaryKey(),
  /** PL: Imię wpisane przez ucznia. Pusty tekst, gdy uczeń go nie podał. EN: The name typed by the student. An empty text when the student gave none. */
  name: text('name').notNull().default(''),
  /** PL: Klasa wpisana przez ucznia, na przykład „3TA”. Pusty tekst, gdy uczeń jej nie podał. EN: The class typed by the student, for example "3TA". An empty text when the student gave none. */
  className: text('class_name').notNull().default(''),
  /** PL: Szkoła ucznia: L (liceum) albo T (technikum). Od niej zależy akcent. EN: The student's school: L (lyceum) or T (technical school). The accent depends on it. */
  school: text('school', { enum: PROFILE_SCHOOLS }).notNull().default('L'),
  /** PL: Wybrana paleta kolorów. Domyślna jest CE Grafit (docs/projekt/EKRANY.md). EN: The chosen color palette. The default is CE Graphite (docs/projekt/EKRANY.md). */
  palette: text('palette', { enum: PROFILE_PALETTES }).notNull().default('CE'),
  /** PL: Kiedy profil ostatnio zapisano (milisekundy od 1970 roku). EN: When the profile was last saved (milliseconds since 1970). */
  updatedAt: integer('updated_at').notNull(),
});
