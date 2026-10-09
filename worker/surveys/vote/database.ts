/**
 * PL: Dostęp do bazy D1 dla podtoru 5a: otwiera Drizzle na wiązaniu DB i rozpoznaje błąd „ten głos już jest”. Wiązania DB nie ma jeszcze w wrangler.jsonc (zgłoszenie #41), więc openDatabase zwraca null, a trasy odpowiadają kodem 503.
 * EN: Database access for subtrack 5a: opens Drizzle on the DB binding and recognises the "this vote already exists" error. The DB binding is not in wrangler.jsonc yet (issue #41), so openDatabase returns null and the routes answer with code 503.
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
 * PL: Wiązania Workera, których potrzebuje podtor 5a. DB jest opcjonalne, bo do czasu zgłoszenia #41 Worker go nie dostaje.
 * EN: The Worker bindings subtrack 5a needs. DB is optional, because until issue #41 the Worker does not receive it.
 */
export type VoteBindings = {
  /** PL: Baza D1 aplikacji. EN: The app's D1 database. */
  DB?: D1Database;
};

/**
 * PL: Baza z tabelami modułu surveys.
 * EN: The database with the surveys module tables.
 */
export type VoteDatabase = DrizzleD1Database<typeof schema>;

/**
 * PL: Otwiera bazę na wiązaniu DB.
 * EN: Opens the database on the DB binding.
 *
 * @param bindings - PL: wiązania Workera z kontekstu zapytania. EN: the Worker bindings from the request context.
 * @returns PL: baza albo null, gdy wiązania DB nie ma. EN: the database, or null when there is no DB binding.
 */
export function openDatabase(bindings: VoteBindings): VoteDatabase | null {
  // PL: Bez wiązania nie ma bazy.
  // EN: Without the binding there is no database.
  if (bindings.DB === undefined) return null;

  // PL: Owiń D1 w Drizzle ze schematem modułu.
  // EN: Wrap D1 in Drizzle with the module schema.
  return drizzle(bindings.DB, { schema });
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
