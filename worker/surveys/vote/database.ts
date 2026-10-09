/**
 * PL: Dostęp do bazy D1 dla podtoru 5a: otwiera Drizzle na wiązaniu DB (c.env.DB albo input.db) i rozpoznaje błąd „ten głos już jest”.
 * EN: Database access for subtrack 5a: opens Drizzle on the DB binding (c.env.DB or input.db) and recognises the "this vote already exists" error.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/db/schema/surveys.ts::surveys
 * @used_by worker/surveys/vote/queries.ts::VoteDatabase
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 */

// PL: Drizzle dla D1: zamienia wiązanie bazy w obiekt z zapytaniami po typach.
// EN: Drizzle for D1: turns the database binding into an object with typed queries.
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
// PL: Tabele modułu surveys.
// EN: The tables of the surveys module.
import * as schema from '../../db/schema/surveys';

/**
 * PL: Baza z tabelami modułu surveys.
 * EN: The database with the surveys module tables.
 */
export type VoteDatabase = DrizzleD1Database<typeof schema>;

/**
 * PL: Otwiera bazę na wiązaniu D1.
 * EN: Opens the database on a D1 binding.
 *
 * @param d1 - PL: baza D1 z c.env.DB albo z input.db. EN: the D1 database from c.env.DB or input.db.
 * @returns PL: baza z tabelami modułu. EN: the database with the module tables.
 */
export function openDatabase(d1: D1Database): VoteDatabase {
  // PL: Owiń D1 w Drizzle ze schematem modułu.
  // EN: Wrap D1 in Drizzle with the module schema.
  return drizzle(d1, { schema });
}

/**
 * PL: Rozpoznaje błąd bazy „naruszenie klucza unikalnego”, czyli próbę drugiego głosu tego samego ucznia. D1 pisze o tym w tekście błędu, a czasem w jego przyczynie.
 * EN: Recognises the database error "unique key violation", i.e. the same student's attempt at a second vote. D1 states it in the error text, sometimes in its cause.
 *
 * @param error - PL: wyjątek złapany przy zapisie. EN: the exception caught during the write.
 * @returns PL: prawda, gdy to naruszenie klucza unikalnego. EN: true when it is a unique key violation.
 */
export function isUniqueViolation(error: unknown): boolean {
  // PL: Zbierz teksty błędu i jego przyczyny w jedną linię.
  // EN: Join the texts of the error and its cause into one line.
  const cause = error instanceof Error ? error.cause : undefined;
  const text = [error, cause].map((item) => (item instanceof Error ? item.message : '')).join(' ');

  // PL: SQLite zgłasza „UNIQUE constraint failed” albo kod SQLITE_CONSTRAINT_PRIMARYKEY przy złamaniu klucza głównego.
  // EN: SQLite reports "UNIQUE constraint failed" or the SQLITE_CONSTRAINT_PRIMARYKEY code when the primary key is broken.
  return /UNIQUE constraint failed|SQLITE_CONSTRAINT_PRIMARYKEY/.test(text);
}
