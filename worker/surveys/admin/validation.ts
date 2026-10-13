/**
 * PL: Sprawdzanie nowej ankiety z telefonu: tytuł i pytania są wymagane, każde pytanie ma od 2 do 5 odpowiedzi, a czas trwania to 3, 7 albo 14 dni. Pytanie „Skala 1–5” (scale_1_5) ma pięć odpowiedzi „1”…„5” tworzonych przez serwer, nie przez telefon. Czysta logika bez bazy.
 *     Tabela z podtoru 5a tych zasad nie wymusza (docs/projekt/EKRANY.md, ekran 6.5b), więc wymusza je serwer 5b. Serwer nie ufa telefonowi (docs/STANDARD_KODU.md, część 6).
 * EN: Checking a new survey from the phone: the title and the questions are required, each question has 2 to 5 options, and the duration is 3, 7 or 14 days. A question of the type scale_1_5 gets five options "1"…"5" made by the server, not by the phone. Pure logic without the database.
 *     The table from subtrack 5a does not enforce these rules (docs/projekt/EKRANY.md, screen 6.5b), so the 5b server does. The server does not trust the phone (docs/STANDARD_KODU.md, part 6).
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses worker/surveys/admin/dates.ts::warsawToUtcMs
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 * @used_by worker/surveys/admin/validation.test.ts::parseNewSurvey
 */

import { QUESTION_TYPES } from '../../db/schema/surveys';
import { warsawToUtcMs } from './dates';
import type { QuestionType } from './types';

// PL: Dozwolone czasy trwania ankiety w dniach (pasek wyboru „3 dni”, „7 dni”, „14 dni” z ekranu 6.5b).
// EN: The allowed survey durations in days (the "3 dni", "7 dni", "14 dni" choice bar of screen 6.5b).
export const DURATIONS_DAYS = [3, 7, 14] as const;

// PL: Najmniej i najwięcej odpowiedzi w pytaniu (ekran 6.5b: od 2 do 5).
// EN: The fewest and the most options in a question (screen 6.5b: from 2 to 5).
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

// PL: Odpowiedzi skali 1–5. Tworzy je serwer, a telefon ich nie wysyła. Te same etykiety i kolejność rozpoznaje głosowanie (worker/surveys/vote, podtor 5a).
// EN: The options of the 1–5 scale. The server makes them, and the phone does not send them. The vote (worker/surveys/vote, subtrack 5a) recognises the same labels in the same order.
export const SCALE_LABELS = ['1', '2', '3', '4', '5'] as const;

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
  /** PL: Pytania w kolejności, każde z typem i odpowiedziami w kolejności. EN: The questions in order, each with its type and its options in order. */
  questions: { prompt: string; type: QuestionType; options: string[] }[];
  /** PL: Czas trwania w dniach, jeden z DURATIONS_DAYS. EN: The duration in days, one of DURATIONS_DAYS. */
  durationDays: number;
  /** PL: Chwila zamknięcia w milisekundach UTC albo null, gdy ankieta kończy się tylko ostatnim dniem. EN: The closing moment in UTC milliseconds, or null when the survey ends only on its last day. */
  closesAt: number | null;
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
 * PL: Czyta typ pytania. Brak typu to „Jeden wybór” (single_choice), a wartość spoza QUESTION_TYPES to błąd (undefined).
 * EN: Reads the question type. A missing type is "Jeden wybór" (single_choice), and a value outside QUESTION_TYPES is an error (undefined).
 *
 * @param value - PL: pole typu z danych telefonu. EN: the type field from the phone's data.
 * @returns PL: typ pytania albo undefined, gdy typ jest zły. EN: the question type, or undefined when the type is bad.
 */
function parseQuestionType(value: unknown): QuestionType | undefined {
  if (value === undefined || value === null) return 'single_choice';
  return (QUESTION_TYPES as readonly unknown[]).includes(value) ? (value as QuestionType) : undefined;
}

/**
 * PL: Sprawdza jedno pytanie: treść, typ i odpowiedzi. Przy skali 1–5 odpowiedzi tworzy serwer (pięć stałych), a przy pozostałych typach to od 2 do 5 odpowiedzi z telefonu.
 * EN: Checks one question: the text, the type and the options. For the 1–5 scale the server makes the options (five fixed ones), and for the other types they are 2 to 5 options from the phone.
 *
 * @param value - PL: pytanie z danych telefonu. EN: a question from the phone's data.
 * @returns PL: poprawne pytanie albo null. EN: the valid question, or null.
 */
function parseQuestion(value: unknown): NewSurvey['questions'][number] | null {
  // PL: Pytanie to obiekt z treścią, typem i tablicą odpowiedzi w dozwolonej liczbie.
  // EN: A question is an object with a text, a type and an options array of an allowed size.
  const raw = value as { prompt?: unknown; type?: unknown; options?: unknown } | null;
  const prompt = cleanText(raw?.prompt, MAX_PROMPT_LENGTH);
  const type = parseQuestionType(raw?.type);
  if (prompt === null || type === undefined) return null;

  // PL: Skala 1–5 nie bierze odpowiedzi z telefonu: serwer daje pięć stałych i ignoruje to, co przyszło w options.
  // EN: The 1–5 scale does not take options from the phone: the server gives the five fixed ones and ignores whatever came in options.
  if (type === 'scale_1_5') return { prompt, type, options: [...SCALE_LABELS] };

  if (!Array.isArray(raw?.options)) return null;
  if (raw.options.length < MIN_OPTIONS || raw.options.length > MAX_OPTIONS) return null;

  // PL: Każda odpowiedź musi mieć treść. Jedna pusta odrzuca całe pytanie.
  // EN: Every option must have a text. One blank option rejects the whole question.
  const options = raw.options.map((option) => cleanText(option, MAX_OPTION_LENGTH));
  return options.every((option) => option !== null) ? { prompt, type, options } : null;
}

/**
 * PL: Czyta pole „Zamknij ankietę”: brak albo pusty tekst to brak terminu (null), a poprawny czas w przyszłości to chwila w milisekundach. Zły zapis, data nie istniejąca i czas przeszły to błąd (undefined).
 * EN: Reads the "Zamknij ankietę" field: a missing or empty text means no closing time (null), and a valid time in the future is a moment in milliseconds. A bad text, a date that does not exist and a past time are an error (undefined).
 *
 * @param value - PL: pole z danych telefonu. EN: the field from the phone's data.
 * @param now - PL: chwila sprawdzenia. EN: the moment of the check.
 * @returns PL: chwila w ms, null (bez terminu) albo undefined (błąd). EN: the moment in ms, null (no closing time) or undefined (an error).
 */
function parseClosesAt(value: unknown, now: Date): number | null | undefined {
  // PL: Puste pole to brak terminu.
  // EN: An empty field means no closing time.
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return undefined;

  // PL: Termin musi istnieć i być w przyszłości.
  // EN: The time must exist and be in the future.
  const closesAt = warsawToUtcMs(value);
  return closesAt === null || closesAt <= now.getTime() ? undefined : closesAt;
}

/**
 * PL: Zamienia dane z telefonu na nową ankietę. Oczekiwany kształt: { title, questions: [{ prompt, type, options: [tekst, ...] }], durationDays, closesAt }, gdzie type to single_choice, multiple_choice albo scale_1_5 (brak typu = single_choice; przy scale_1_5 options są ignorowane), a closesAt jest czasem polskim RRRR-MM-DDTHH:mm albo pusty.
 * EN: Turns the data from the phone into a new survey. Expected shape: { title, questions: [{ prompt, type, options: [text, ...] }], durationDays, closesAt }, where type is single_choice, multiple_choice or scale_1_5 (no type = single_choice; with scale_1_5 the options are ignored), and closesAt is the Polish time YYYY-MM-DDTHH:mm or empty.
 *
 * @param body - PL: odczytany JSON zapytania (dowolna wartość). EN: the parsed JSON of the request (any value).
 * @param now - PL: chwila, od której termin musi być w przyszłości. EN: the moment from which the closing time must be in the future.
 * @returns PL: poprawna ankieta albo null, gdy cokolwiek jest złe. EN: the valid survey, or null when anything is wrong.
 */
export function parseNewSurvey(body: unknown, now: Date): NewSurvey | null {
  // PL: Tytuł, lista pytań w dozwolonej liczbie, czas trwania z listy i termin zamknięcia.
  // EN: The title, a question list of an allowed size, a duration from the list and the closing time.
  const raw = body as { title?: unknown; questions?: unknown; durationDays?: unknown; closesAt?: unknown } | null;
  const title = cleanText(raw?.title, MAX_TITLE_LENGTH);
  const { questions, durationDays } = raw ?? {};
  if (title === null || !Array.isArray(questions) || questions.length < 1 || questions.length > MAX_QUESTIONS) return null;
  if (!DURATIONS_DAYS.some((allowed) => allowed === durationDays)) return null;
  const closesAt = parseClosesAt(raw?.closesAt, now);
  if (closesAt === undefined) return null;

  // PL: Każde pytanie musi być poprawne.
  // EN: Every question must be valid.
  const parsed = questions.map(parseQuestion);
  if (!parsed.every((question) => question !== null)) return null;
  return { title, questions: parsed, durationDays: durationDays as number, closesAt };
}
