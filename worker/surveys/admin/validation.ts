/**
 * PL: Sprawdzanie nowej ankiety z telefonu: tytuł i pytania są wymagane, każde pytanie ma od 2 do 5 odpowiedzi, a czas trwania to 3, 7 albo 14 dni. Czysta logika bez bazy.
 *     Tabela z podtoru 5a tych zasad nie wymusza (docs/projekt/EKRANY.md, ekran 6.5b), więc wymusza je serwer 5b. Serwer nie ufa telefonowi (docs/STANDARD_KODU.md, część 6).
 * EN: Checking a new survey from the phone: the title and the questions are required, each question has 2 to 5 options, and the duration is 3, 7 or 14 days. Pure logic without the database.
 *     The table from subtrack 5a does not enforce these rules (docs/projekt/EKRANY.md, screen 6.5b), so the 5b server does. The server does not trust the phone (docs/STANDARD_KODU.md, part 6).
 *
 * @author Jakub
 * @since 2026-10-12
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 * @used_by worker/surveys/admin/validation.test.ts::parseNewSurvey
 */

// PL: Dozwolone czasy trwania ankiety w dniach (pasek wyboru „3 dni”, „7 dni”, „14 dni” z ekranu 6.5b).
// EN: The allowed survey durations in days (the "3 dni", "7 dni", "14 dni" choice bar of screen 6.5b).
export const DURATIONS_DAYS = [3, 7, 14] as const;

// PL: Najmniej i najwięcej odpowiedzi w pytaniu (ekran 6.5b: od 2 do 5).
// EN: The fewest and the most options in a question (screen 6.5b: from 2 to 5).
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

// PL: Najwięcej pytań w ankiecie. Ekran nie podaje limitu, ten odcina śmieciowe zapytania i mieści zapis w limicie D1 (100 wartości na zapytanie).
// EN: The most questions in a survey. The screen gives no limit, this one cuts off junk requests and keeps the write within the D1 limit (100 values per query).
const MAX_QUESTIONS = 10;

// PL: Najdłuższy tytuł, pytanie i odpowiedź w znakach. Odcina śmieci, a w telefonie pola mają ten sam limit.
// EN: The longest title, question and option in characters. Cuts off junk, and the phone fields have the same limit.
export const MAX_TITLE_LENGTH = 120;
export const MAX_PROMPT_LENGTH = 200;
export const MAX_OPTION_LENGTH = 100;

/**
 * PL: Poprawna nowa ankieta, gotowa do zapisu.
 * EN: A valid new survey, ready to be written.
 */
export type NewSurvey = {
  /** PL: Tytuł bez spacji na brzegach. EN: The title without edge spaces. */
  title: string;
  /** PL: Pytania w kolejności, każde z odpowiedziami w kolejności. EN: The questions in order, each with its options in order. */
  questions: { prompt: string; options: string[] }[];
  /** PL: Czas trwania w dniach, jeden z DURATIONS_DAYS. EN: The duration in days, one of DURATIONS_DAYS. */
  durationDays: number;
};

/**
 * PL: Czyści tekst z pola: tylko tekst, bez spacji na brzegach, niepusty i niedłuższy niż limit.
 * EN: Cleans a field text: text only, no edge spaces, non-empty and not longer than the limit.
 *
 * @param value - PL: wartość z danych telefonu. EN: a value from the phone's data.
 * @param maxLength - PL: najwięcej znaków. EN: the most characters.
 * @returns PL: czysty tekst albo null, gdy tekst jest zły. EN: the clean text, or null when the text is bad.
 */
function cleanText(value: unknown, maxLength: number): string | null {
  // PL: Tylko tekst.
  // EN: Text only.
  if (typeof value !== 'string') return null;

  // PL: Pusty po przycięciu albo za długi tekst odpada.
  // EN: A text that is empty after trimming, or too long, is rejected.
  const text = value.trim();
  return text.length > 0 && text.length <= maxLength ? text : null;
}

/**
 * PL: Sprawdza jedno pytanie: treść i od 2 do 5 odpowiedzi.
 * EN: Checks one question: the text and 2 to 5 options.
 *
 * @param value - PL: pytanie z danych telefonu. EN: a question from the phone's data.
 * @returns PL: poprawne pytanie albo null. EN: the valid question, or null.
 */
function parseQuestion(value: unknown): NewSurvey['questions'][number] | null {
  // PL: Pytanie to obiekt z treścią i tablicą odpowiedzi w dozwolonej liczbie.
  // EN: A question is an object with a text and an options array of an allowed size.
  const raw = value as { prompt?: unknown; options?: unknown } | null;
  const prompt = cleanText(raw?.prompt, MAX_PROMPT_LENGTH);
  if (prompt === null || !Array.isArray(raw?.options)) return null;
  if (raw.options.length < MIN_OPTIONS || raw.options.length > MAX_OPTIONS) return null;

  // PL: Każda odpowiedź musi mieć treść. Jedna pusta odrzuca całe pytanie.
  // EN: Every option must have a text. One blank option rejects the whole question.
  const options = raw.options.map((option) => cleanText(option, MAX_OPTION_LENGTH));
  return options.every((option) => option !== null) ? { prompt, options } : null;
}

/**
 * PL: Zamienia dane z telefonu na nową ankietę. Oczekiwany kształt: { title, questions: [{ prompt, options: [tekst, ...] }], durationDays }.
 * EN: Turns the data from the phone into a new survey. Expected shape: { title, questions: [{ prompt, options: [text, ...] }], durationDays }.
 *
 * @param body - PL: odczytany JSON zapytania (dowolna wartość). EN: the parsed JSON of the request (any value).
 * @returns PL: poprawna ankieta albo null, gdy cokolwiek jest złe. EN: the valid survey, or null when anything is wrong.
 */
export function parseNewSurvey(body: unknown): NewSurvey | null {
  // PL: Tytuł, lista pytań w dozwolonej liczbie i czas trwania z listy.
  // EN: The title, a question list of an allowed size and a duration from the list.
  const raw = body as { title?: unknown; questions?: unknown; durationDays?: unknown } | null;
  const title = cleanText(raw?.title, MAX_TITLE_LENGTH);
  const { questions, durationDays } = raw ?? {};
  if (title === null || !Array.isArray(questions) || questions.length < 1 || questions.length > MAX_QUESTIONS) return null;
  if (!DURATIONS_DAYS.some((allowed) => allowed === durationDays)) return null;

  // PL: Każde pytanie musi być poprawne.
  // EN: Every question must be valid.
  const parsed = questions.map(parseQuestion);
  if (!parsed.every((question) => question !== null)) return null;
  return { title, questions: parsed, durationDays: durationDays as number };
}
