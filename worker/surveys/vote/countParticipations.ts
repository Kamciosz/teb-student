/**
 * PL: Liczy udziały w ankietach (wiersze survey_participation) dla ekranu panelu Samorządu. Zwraca tylko liczbę, bez numerów uczniów i bez wyborów odpowiedzi.
 * EN: Counts the survey participations (survey_participation rows) for a screen of the Student Council panel. Returns only the number, without student ids and without the answers chosen.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/surveys.ts::surveyParticipation
 * @used_by worker/surveys/vote/index.ts::countSurveyParticipations
 * @used_by worker/surveys/vote/countParticipations.test.ts::countSurveyParticipations
 */

// PL: Funkcja count z Drizzle liczy wiersze.
// EN: Drizzle's count function counts rows.
import { count } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabela udziałów w ankietach.
// EN: The survey participation table.
import { surveyParticipation } from '../../db/schema/surveys';

/**
 * PL: Liczba udziałów we wszystkich ankietach. Nie czyta kolumn ucznia ani wyborów, tylko liczy wiersze.
 * EN: The number of participations in all surveys. It does not read the student or choice columns, it only counts rows.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: liczba udziałów, zero, gdy ich nie ma. EN: the number of participations, zero when there are none.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function countSurveyParticipations(db: D1Database): Promise<number> {
  // PL: Jedno zapytanie SELECT count(*) z tabeli udziałów.
  // EN: One SELECT count(*) query on the participation table.
  const [row] = await drizzle(db).select({ total: count() }).from(surveyParticipation);

  // PL: Zapytanie zawsze zwraca jeden wiersz, ale na wszelki wypadek brak wiersza daje zero.
  // EN: The query always returns one row, but just in case a missing row gives zero.
  return row?.total ?? 0;
}
