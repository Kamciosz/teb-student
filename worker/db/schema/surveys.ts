/**
 * PL: Schemat bazy modułu surveys (tabele Drizzle): ankiety, pytania, odpowiedzi do wyboru oraz zapis, że uczeń już głosował.
 *     Prywatność: odpowiedzi ucznia nie są nigdzie zapisane. Wiersz „kto głosował” (survey_participation) nie ma żadnej
 *     wspólnej kolumny z wynikiem, a wynik to same liczniki przy odpowiedziach (survey_options.votes), bez numeru ucznia i bez czasu.
 *     Przy dostępie do całej bazy da się więc ustalić tylko, że uczeń wypełnił ankietę, ale nie co zaznaczył.
 *     Schemat modułu należy do podtoru 5a (docs/PODZIAL_PRACY.md, część 2).
 * EN: The database schema of the surveys module (Drizzle tables): surveys, questions, answer options and the record that a
 *     student has already voted. Privacy: a student's answers are stored nowhere. The "who voted" row (survey_participation)
 *     shares no column with the result, and the result is only counters on the options (survey_options.votes), with no student id and no time.
 *     With access to the whole database one can learn only that a student filled the survey in, not what they picked.
 *     The module schema belongs to subtrack 5a (docs/PODZIAL_PRACY.md, part 2).
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/surveys/vote/queries.ts::surveys
 * @used_by worker/surveys/vote/schema.test.ts::surveys
 * @used_by worker/db/seed/surveys.ts::surveys
 */

// PL: Funkcje Drizzle do opisu tabel SQLite (D1 to SQLite).
// EN: Drizzle functions that describe SQLite tables (D1 is SQLite).
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Rodzaje pytań. Dziś tylko jednokrotny wybór, ale kolumna już jest, żeby rozbudowa (pytanie otwarte, skala) nie wymagała przepisywania tabel (docs/PLAN_APLIKACJI.md, część 2).
 * EN: The question types. Only single choice today, but the column already exists, so the expansion (open question, scale) does not need the tables rewritten (docs/PLAN_APLIKACJI.md, part 2).
 */
export const QUESTION_TYPES = ['single_choice'] as const;

/**
 * PL: Ankiety. Ankieta jest aktywna do końca dnia w kolumnie ends_on (czas polski).
 * EN: Surveys. A survey is active until the end of the day in the ends_on column (Polish time).
 */
export const surveys = sqliteTable('surveys', {
  /** PL: Numer ankiety, tekst nadany przy tworzeniu. EN: The survey id, text assigned on creation. */
  id: text('id').primaryKey(),
  /** PL: Krótki temat nad tytułem i w nagłówku pytań, na przykład „Zajęcia dodatkowe”. Może go nie być. EN: Short topic above the title and in the question header, for example "Zajęcia dodatkowe". It may be missing. */
  label: text('label'),
  /** PL: Tytuł ankiety na liście. EN: The survey title on the list. */
  title: text('title').notNull(),
  /** PL: Ostatni dzień ankiety, data RRRR-MM-DD (czas polski). EN: The last day of the survey, a YYYY-MM-DD date (Polish time). */
  endsOn: text('ends_on').notNull(),
});

/**
 * PL: Pytania ankiety, w kolejności z kolumny position.
 * EN: The survey questions, in the order of the position column.
 */
export const surveyQuestions = sqliteTable(
  'survey_questions',
  {
    /** PL: Numer pytania. EN: The question id. */
    id: text('id').primaryKey(),
    /** PL: Ankieta, do której należy pytanie. Skasowanie ankiety kasuje pytania. EN: The survey the question belongs to. Deleting the survey deletes the questions. */
    surveyId: text('survey_id')
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    /** PL: Miejsce pytania w ankiecie, od 1. EN: The place of the question in the survey, from 1. */
    position: integer('position').notNull(),
    /** PL: Rodzaj pytania z QUESTION_TYPES. EN: The question type from QUESTION_TYPES. */
    type: text('type', { enum: QUESTION_TYPES }).notNull().default('single_choice'),
    /** PL: Treść pytania. EN: The question text. */
    prompt: text('prompt').notNull(),
  },
  (table) => [index('survey_questions_survey_idx').on(table.surveyId, table.position)],
);

/**
 * PL: Odpowiedzi do wyboru. Kolumna votes to licznik, jedyne miejsce, w którym zapisany jest wynik. Nie ma tu numeru ucznia ani czasu.
 * EN: The answer options. The votes column is a counter, the only place where the result is stored. There is no student id and no time here.
 */
export const surveyOptions = sqliteTable(
  'survey_options',
  {
    /** PL: Numer odpowiedzi. EN: The option id. */
    id: text('id').primaryKey(),
    /** PL: Pytanie, do którego należy odpowiedź. EN: The question the option belongs to. */
    questionId: text('question_id')
      .notNull()
      .references(() => surveyQuestions.id, { onDelete: 'cascade' }),
    /** PL: Miejsce odpowiedzi w pytaniu, od 1 (A, B, C, D). EN: The place of the option in the question, from 1 (A, B, C, D). */
    position: integer('position').notNull(),
    /** PL: Treść odpowiedzi. EN: The option text. */
    label: text('label').notNull(),
    /** PL: Ile osób wybrało tę odpowiedź. Rośnie o 1 przy każdym głosie. Telefon nigdy go nie dostaje (wyniki widzi tylko Samorząd). EN: How many people picked this option. Grows by 1 with every vote. The phone never receives it (only the Student Council sees results). */
    votes: integer('votes').notNull().default(0),
  },
  (table) => [index('survey_options_question_idx').on(table.questionId, table.position)],
);

/**
 * PL: Kto już wypełnił ankietę. Klucz (survey_id, user_id) pilnuje, że uczeń głosuje raz, także przy dwóch zapytaniach naraz. Bez czasu i bez odpowiedzi.
 *     Numer ucznia nie ma klucza obcego, bo tabele kont zakłada podtor 1a (zgłoszenie #42).
 * EN: Who has already filled in a survey. The (survey_id, user_id) key guarantees one vote per student, also with two requests at once. No time and no answers.
 *     The student id has no foreign key, because subtrack 1a creates the account tables (issue #42).
 */
export const surveyParticipation = sqliteTable(
  'survey_participation',
  {
    /** PL: Wypełniona ankieta. EN: The survey that was filled in. */
    surveyId: text('survey_id')
      .notNull()
      .references(() => surveys.id, { onDelete: 'cascade' }),
    /** PL: Numer ucznia, który ją wypełnił. EN: The id of the student who filled it in. */
    userId: text('user_id').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.surveyId, table.userId] }),
    // PL: Kasowanie danych ucznia szuka po samym numerze ucznia, a klucz główny zaczyna się od ankiety.
    // EN: Deleting a student's data searches by the student id alone, while the primary key starts with the survey.
    index('survey_participation_user_idx').on(table.userId),
  ],
);
