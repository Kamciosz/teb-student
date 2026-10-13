/**
 * PL: Lista ankiet, w których jeden uczeń brał udział, dla eksportu danych RODO („Pobierz moje dane”). Zwraca tylko dane ankiety (numer, temat, tytuł, ostatni dzień), bez wyborów odpowiedzi i bez liczników, bo tabela udziałów nie ma żadnej wspólnej kolumny z wynikiem.
 * EN: The list of surveys that one student took part in, for the GDPR data export ("Download my data"). It returns only the survey data (id, label, title, last day), without the answers chosen and without the counters, because the participation table shares no column with the result.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/surveys.ts::surveys
 * @uses worker/db/schema/surveys.ts::surveyParticipation
 * @used_by worker/surveys/vote/index.ts::listParticipatedSurveys
 * @used_by worker/surveys/vote/listParticipatedSurveys.test.ts::listParticipatedSurveys
 */

// PL: Funkcje Drizzle do porządku, warunku i złączenia.
// EN: Drizzle functions for ordering, the condition and the join.
import { asc, desc, eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele udziałów i ankiet.
// EN: The participation and survey tables.
import { surveyParticipation, surveys } from '../../db/schema/surveys';

/**
 * PL: Ankieta w takiej postaci, w jakiej wraca do eksportu ucznia. Celowo nie ma tu wyborów odpowiedzi, liczników ani czasu udziału.
 * EN: A survey in the form that goes back to the student's export. There are deliberately no answers chosen, no counters and no participation time.
 */
export type ParticipatedSurvey = {
  /** PL: Numer ankiety. EN: The survey id. */
  id: string;
  /** PL: Krótki temat ankiety, albo `null`. EN: The short topic of the survey, or `null`. */
  label: string | null;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Ostatni dzień ankiety, RRRR-MM-DD. EN: The last day of the survey, YYYY-MM-DD. */
  endsOn: string;
};

/**
 * PL: Czyta ankiety wypełnione przez jednego ucznia, od ostatnio kończącej się. Nigdy nie zwraca cudzych udziałów ani odpowiedzi.
 * EN: Reads the surveys filled in by one student, the latest ending first. Never returns other people's participations or answers.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param userId - PL: numer ucznia, którego udziały czytamy. EN: the id of the student whose participations we read.
 * @returns PL: lista ankiet tego ucznia, pusta, gdy nie wypełniał żadnej. EN: the list of this student's surveys, empty when they filled in none.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function listParticipatedSurveys(db: D1Database, userId: string): Promise<ParticipatedSurvey[]> {
  // PL: Złącz udziały ucznia z ankietami i wybierz tylko pola ankiety.
  // EN: Join the student's participations with the surveys and select only the survey fields.
  return drizzle(db)
    .select({ id: surveys.id, label: surveys.label, title: surveys.title, endsOn: surveys.endsOn })
    .from(surveyParticipation)
    .innerJoin(surveys, eq(surveys.id, surveyParticipation.surveyId))
    .where(eq(surveyParticipation.userId, userId))
    .orderBy(desc(surveys.endsOn), asc(surveys.id));
}
