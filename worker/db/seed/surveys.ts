/**
 * PL: Dane testowe modułu surveys: wymyślone ankiety, pytania i odpowiedzi do lokalnej bazy. Treść pierwszej ankiety i pierwszych dwóch pytań jest z docs/projekt/EKRANY.md (ekrany 4.1–4.3), trzecie pytanie jest wymyślone, bo projekt go nie podaje.
 *     Liczniki głosów zaczynają od zera, a „kto głosował” zostaje puste, bo nie ma jeszcze kont uczniów.
 * EN: The test data of the surveys module: invented surveys, questions and options for the local database. The text of the first survey and its first two questions comes from docs/projekt/EKRANY.md (screens 4.1–4.3), the third question is invented, because the design does not give it.
 *     The vote counters start at zero, and "who voted" stays empty, because there are no student accounts yet.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/db/schema/surveys.ts::surveys
 * @uses worker/shared/seed.ts::SeedSet
 * @used_by worker/db/seed/index.ts::*
 */

// PL: Typy wierszy, żeby kompilator pilnował zgodności danych ze schematem.
// EN: The row types, so the compiler keeps the data in line with the schema.
import { surveyOptions, surveyQuestions, surveys } from '../schema/surveys';
// PL: Typ zestawu danych testowych (tabela i jej wiersze).
// EN: The test data set type (a table and its rows).
import type { SeedSet } from '../../shared/seed';

/**
 * PL: Ankiety testowe: aktywna (do końca roku), aktywna druga i zakończona.
 * EN: Test surveys: an active one (until the end of the year), a second active one and an ended one.
 */
export const SURVEYS_SEED: (typeof surveys.$inferInsert)[] = [
  { id: 'dodatkowe', label: 'Zajęcia dodatkowe', title: 'Zajęcia dodatkowe w II semestrze', endsOn: '2026-12-31' },
  { id: 'stolowka', label: null, title: 'Obiad w stołówce', endsOn: '2026-12-31' },
  { id: 'dzwonki', label: null, title: 'Plan dzwonków', endsOn: '2026-09-30' },
];

/**
 * PL: Pytania testowe. Ankieta „dodatkowe” ma trzy pytania, jak na ekranie 4.1, a pozostałe po jednym.
 * EN: Test questions. The "dodatkowe" survey has three questions, as on screen 4.1, and the others have one each.
 */
export const SURVEY_QUESTIONS_SEED: (typeof surveyQuestions.$inferInsert)[] = [
  { id: 'dodatkowe-1', surveyId: 'dodatkowe', position: 1, prompt: 'Jakie zajęcia dodatkowe chcesz w drugim semestrze?' },
  { id: 'dodatkowe-2', surveyId: 'dodatkowe', position: 2, prompt: 'Ile razy w tygodniu możesz zostać po lekcjach?' },
  { id: 'dodatkowe-3', surveyId: 'dodatkowe', position: 3, prompt: 'Który dzień tygodnia pasuje Ci najlepiej?' },
  { id: 'stolowka-1', surveyId: 'stolowka', position: 1, prompt: 'Jak oceniasz obiady w stołówce?' },
  { id: 'dzwonki-1', surveyId: 'dzwonki', position: 1, prompt: 'Czy przerwy są wystarczająco długie?' },
];

/**
 * PL: Odpowiedzi testowe z licznikiem głosów równym zero. Pytania 1 i 2 ankiety „dodatkowe” mają treść z docs/projekt/EKRANY.md.
 * EN: Test options with a vote counter equal to zero. Questions 1 and 2 of the "dodatkowe" survey have the text from docs/projekt/EKRANY.md.
 */
export const SURVEY_OPTIONS_SEED: (typeof surveyOptions.$inferInsert)[] = [
  { id: 'dodatkowe-1-a', questionId: 'dodatkowe-1', position: 1, label: 'Koło programowania gier' },
  { id: 'dodatkowe-1-b', questionId: 'dodatkowe-1', position: 2, label: 'Siatkówka' },
  { id: 'dodatkowe-1-c', questionId: 'dodatkowe-1', position: 3, label: 'Przygotowanie do matury z matematyki' },
  { id: 'dodatkowe-1-d', questionId: 'dodatkowe-1', position: 4, label: 'Fotografia' },
  { id: 'dodatkowe-2-a', questionId: 'dodatkowe-2', position: 1, label: 'Raz' },
  { id: 'dodatkowe-2-b', questionId: 'dodatkowe-2', position: 2, label: 'Dwa razy' },
  { id: 'dodatkowe-2-c', questionId: 'dodatkowe-2', position: 3, label: 'Trzy razy lub więcej' },
  { id: 'dodatkowe-2-d', questionId: 'dodatkowe-2', position: 4, label: 'Nie mogę zostawać' },
  { id: 'dodatkowe-3-a', questionId: 'dodatkowe-3', position: 1, label: 'Poniedziałek' },
  { id: 'dodatkowe-3-b', questionId: 'dodatkowe-3', position: 2, label: 'Wtorek' },
  { id: 'dodatkowe-3-c', questionId: 'dodatkowe-3', position: 3, label: 'Środa' },
  { id: 'dodatkowe-3-d', questionId: 'dodatkowe-3', position: 4, label: 'Czwartek' },
  { id: 'stolowka-1-a', questionId: 'stolowka-1', position: 1, label: 'Dobrze' },
  { id: 'stolowka-1-b', questionId: 'stolowka-1', position: 2, label: 'Średnio' },
  { id: 'stolowka-1-c', questionId: 'stolowka-1', position: 3, label: 'Źle' },
  { id: 'dzwonki-1-a', questionId: 'dzwonki-1', position: 1, label: 'Tak' },
  { id: 'dzwonki-1-b', questionId: 'dzwonki-1', position: 2, label: 'Nie' },
];

/**
 * PL: Zestawy danych testowych modułu: scripts/db.ts wpisuje je do bazy po `npm run db:seed`. Tabela udziału (survey_participation) zostaje pusta, bo nie ma jeszcze kont uczniów.
 * EN: The module's test data sets: scripts/db.ts inserts them into the database on `npm run db:seed`. The participation table (survey_participation) stays empty, because there are no student accounts yet.
 */
export const SURVEYS_SEED_SETS: SeedSet[] = [
  { table: surveys, rows: SURVEYS_SEED },
  { table: surveyQuestions, rows: SURVEY_QUESTIONS_SEED },
  { table: surveyOptions, rows: SURVEY_OPTIONS_SEED },
];
