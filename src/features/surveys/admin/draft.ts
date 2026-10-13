/**
 * PL: Szkic nowej ankiety (ekran 6.5b) jako zwykłe dane i funkcje bez Reacta: dodawanie i usuwanie pytań oraz odpowiedzi z limitami, sprawdzanie pól z tekstami błędów z EKRANY.md i zamiana szkicu na treść zapytania. Ekran tylko rysuje i woła te funkcje.
 *     Zasady są z EKRANY.md, ekran 6.5b: tytuł i pytanie są wymagane, pytanie ma od 2 do 5 odpowiedzi, a czas trwania to 3, 7 albo 14 dni. Te same zasady sprawdza serwer (worker/surveys/admin/validation.ts), bo telefonowi nie ufa.
 * EN: The draft of a new survey (screen 6.5b) as plain data and functions without React: adding and removing questions and options with limits, checking the fields with the error texts from EKRANY.md and turning the draft into the request body. The screen only draws and calls these functions.
 *     The rules are from EKRANY.md, screen 6.5b: the title and the question are required, a question has 2 to 5 options, and the duration is 3, 7 or 14 days. The server checks the same rules (worker/surveys/admin/validation.ts), because it does not trust the phone.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/types.ts::NewSurveyBody
 * @uses src/features/surveys/admin/format.ts::lastDayIso
 * @uses src/features/surveys/admin/format.ts::warsawWallClock
 * @used_by src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @used_by src/features/surveys/admin/QuestionEditor.tsx::QuestionEditor
 * @used_by src/features/surveys/admin/draft.test.ts::validateDraft
 */

import { lastDayIso, warsawWallClock } from './format';
import type { NewSurveyBody, QuestionType } from './types';

// PL: Czasy trwania z paska wyboru, w dniach. Domyślnie 7 dni (ekran 6.5b).
// EN: The durations of the choice bar, in days. 7 days by default (screen 6.5b).
export const DURATION_CHOICES = [3, 7, 14] as const;
export const DEFAULT_DURATION_DAYS = 7;

// PL: Najmniej i najwięcej odpowiedzi w pytaniu oraz najwięcej pytań. Limit pytań i długości pól jest taki sam jak na serwerze.
// EN: The fewest and the most options in a question and the most questions. The question limit and the field lengths are the same as on the server.
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 5;
export const MAX_QUESTIONS = 10;
export const MAX_TITLE_LENGTH = 120;
export const MAX_PROMPT_LENGTH = 200;
export const MAX_OPTION_LENGTH = 100;

/** PL: Pytanie w szkicu. EN: A question in the draft. */
export type DraftQuestion = {
  /** PL: Stały numer pytania w szkicu (klucz listy w Reakcie), nie zmienia się przy usuwaniu innych pytań. EN: The question's stable number in the draft (the React list key), it does not change when other questions are removed. */
  key: number;
  /** PL: Treść pytania. EN: The question text. */
  prompt: string;
  /** PL: Rodzaj pytania. Nowe pytanie to „Jeden wybór”. EN: The question type. A new question is "Jeden wybór" (single choice). */
  type: QuestionType;
  /** PL: Treści odpowiedzi w kolejności A, B, C, D, E, także puste. EN: The option texts in the order A, B, C, D, E, also blank ones. */
  options: string[];
};

/** PL: Szkic nowej ankiety. EN: The draft of a new survey. */
export type Draft = {
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Pytania w kolejności. EN: The questions in order. */
  questions: DraftQuestion[];
  /** PL: Wybrany czas trwania w dniach. EN: The chosen duration in days. */
  durationDays: number;
  /** PL: Numer, który dostanie następne dodane pytanie. EN: The number the next added question gets. */
  nextKey: number;
  /** PL: Termin zamknięcia RRRR-MM-DDTHH:mm (czas polski) albo pusty tekst, gdy go nie ma. EN: The closing time YYYY-MM-DDTHH:mm (Polish time), or an empty text when there is none. */
  closesAt: string;
};

/** PL: Błędy pól jednego pytania: tekst błędu albo null, gdy pole jest dobre. EN: The field errors of one question: the error text, or null when the field is fine. */
export type QuestionErrors = { prompt: string | null; options: string | null };

/** PL: Błędy całego szkicu. EN: The errors of the whole draft. */
export type DraftErrors = { title: string | null; questions: Map<number, QuestionErrors>; closesAt: string | null };

/**
 * PL: Tworzy pusty szkic: bez tytułu, z jednym pytaniem o dwóch pustych odpowiedziach, z 7 dniami i bez terminu zamknięcia.
 * EN: Creates an empty draft: no title, one question with two blank options, 7 days and no closing time.
 *
 * @returns PL: nowy szkic. EN: a new draft.
 */
export function newDraft(): Draft {
  return { title: '', questions: [{ key: 1, prompt: '', type: 'single_choice', options: ['', ''] }], durationDays: DEFAULT_DURATION_DAYS, nextKey: 2, closesAt: '' };
}

/**
 * PL: Zmienia jedno pytanie szkicu, resztę zostawia.
 * EN: Changes one question of the draft and leaves the rest.
 *
 * @param draft - PL: szkic. EN: the draft.
 * @param key - PL: numer pytania. EN: the question number.
 * @param change - PL: funkcja, która z pytania robi nowe pytanie. EN: the function that turns the question into a new question.
 * @returns PL: nowy szkic. EN: a new draft.
 */
export function updateQuestion(draft: Draft, key: number, change: (question: DraftQuestion) => DraftQuestion): Draft {
  return { ...draft, questions: draft.questions.map((question) => (question.key === key ? change(question) : question)) };
}

/**
 * PL: Dodaje puste pytanie z dwiema pustymi odpowiedziami. Przy limicie pytań nic nie zmienia.
 * EN: Adds a blank question with two blank options. At the question limit it changes nothing.
 *
 * @param draft - PL: szkic. EN: the draft.
 * @returns PL: nowy szkic. EN: a new draft.
 */
export function addQuestion(draft: Draft): Draft {
  // PL: Przy limicie pytań przycisk „Dodaj pytanie” jest nieaktywny, ale funkcja też go pilnuje.
  // EN: At the question limit the "Dodaj pytanie" button is inactive, but the function guards it too.
  if (draft.questions.length >= MAX_QUESTIONS) return draft;
  const question: DraftQuestion = { key: draft.nextKey, prompt: '', type: 'single_choice', options: ['', ''] };
  return { ...draft, questions: [...draft.questions, question], nextKey: draft.nextKey + 1 };
}

/**
 * PL: Usuwa pytanie. Ostatniego pytania nie da się usunąć, bo ankieta ma co najmniej jedno.
 * EN: Removes a question. The last question cannot be removed, because a survey has at least one.
 *
 * @param draft - PL: szkic. EN: the draft.
 * @param key - PL: numer pytania. EN: the question number.
 * @returns PL: nowy szkic. EN: a new draft.
 */
export function removeQuestion(draft: Draft, key: number): Draft {
  if (draft.questions.length <= 1) return draft;
  return { ...draft, questions: draft.questions.filter((question) => question.key !== key) };
}

/**
 * PL: Dodaje pustą odpowiedź do pytania. Przy pięciu odpowiedziach nic nie zmienia.
 * EN: Adds a blank option to a question. With five options it changes nothing.
 *
 * @param question - PL: pytanie. EN: the question.
 * @returns PL: nowe pytanie. EN: a new question.
 */
export function addOption(question: DraftQuestion): DraftQuestion {
  return question.options.length >= MAX_OPTIONS ? question : { ...question, options: [...question.options, ''] };
}

/**
 * PL: Usuwa odpowiedź z pytania. Przy dwóch odpowiedziach nic nie zmienia.
 * EN: Removes an option from a question. With two options it changes nothing.
 *
 * @param question - PL: pytanie. EN: the question.
 * @param index - PL: miejsce odpowiedzi od 0. EN: the option place from 0.
 * @returns PL: nowe pytanie. EN: a new question.
 */
export function removeOption(question: DraftQuestion, index: number): DraftQuestion {
  if (question.options.length <= MIN_OPTIONS) return question;
  return { ...question, options: question.options.filter((_, place) => place !== index) };
}

/**
 * PL: Sprawdza pola jednego pytania. Za „odpowiedź” liczy się niepusty tekst, więc dwa puste wiersze to za mało.
 * EN: Checks the fields of one question. A non-blank text counts as an "option", so two blank rows are not enough.
 *
 * @param question - PL: pytanie. EN: the question.
 * @returns PL: błędy pól. EN: the field errors.
 */
function checkQuestion(question: DraftQuestion): QuestionErrors {
  const filled = question.options.filter((option) => option.trim() !== '').length;
  return {
    prompt: question.prompt.trim() === '' ? 'Wpisz pytanie.' : null,
    options: filled < MIN_OPTIONS ? 'Dodaj co najmniej dwie odpowiedzi.' : null,
  };
}

/**
 * PL: Sprawdza termin zamknięcia: musi być w przyszłości i nie może wypaść po ostatnim dniu ankiety. Oba teksty to czas polski RRRR-MM-DDTHH:mm, więc wystarczy zwykłe porównanie napisów.
 * EN: Checks the closing time: it must be in the future and not fall after the last day of the survey. Both texts are Polish time YYYY-MM-DDTHH:mm, so a plain string comparison is enough.
 *
 * @param draft - PL: szkic. EN: the draft.
 * @param now - PL: chwila sprawdzania. EN: the moment of the check.
 * @returns PL: tekst błędu albo null. EN: the error text, or null.
 */
function checkClosesAt(draft: Draft, now: Date): string | null {
  if (draft.closesAt === '') return null;
  if (draft.closesAt <= warsawWallClock(now)) return 'Termin musi być w przyszłości.';
  if (draft.closesAt.slice(0, 10) > lastDayIso(now, draft.durationDays)) return 'Termin nie może być później niż ostatni dzień ankiety.';
  return null;
}

/**
 * PL: Sprawdza cały szkic i podaje teksty błędów pod polami (EKRANY.md, ekran 6.5b).
 * EN: Checks the whole draft and gives the error texts under the fields (EKRANY.md, screen 6.5b).
 *
 * @param draft - PL: szkic. EN: the draft.
 * @param now - PL: chwila sprawdzania, do oceny terminu zamknięcia. EN: the moment of the check, for judging the closing time.
 * @returns PL: błędy tytułu, pytań i terminu. EN: the title, question and closing time errors.
 */
export function validateDraft(draft: Draft, now: Date): DraftErrors {
  const questions = new Map(draft.questions.map((question) => [question.key, checkQuestion(question)]));
  return { title: draft.title.trim() === '' ? 'Wpisz tytuł ankiety.' : null, questions, closesAt: checkClosesAt(draft, now) };
}

/**
 * PL: Mówi, czy w błędach jest cokolwiek do poprawienia.
 * EN: Tells whether the errors contain anything to fix.
 *
 * @param errors - PL: błędy szkicu. EN: the draft errors.
 * @returns PL: prawda, gdy jest błąd. EN: true when there is an error.
 */
export function hasErrors(errors: DraftErrors): boolean {
  return errors.title !== null || errors.closesAt !== null || [...errors.questions.values()].some((item) => item.prompt !== null || item.options !== null);
}

/**
 * PL: Zamienia poprawny szkic na treść zapytania: tekst bez spacji na brzegach, bez pustych odpowiedzi, a pusty termin zamknięcia jako null.
 * EN: Turns a valid draft into the request body: text without edge spaces, without blank options, and an empty closing time as null.
 *
 * @param draft - PL: poprawny szkic. EN: a valid draft.
 * @returns PL: treść zapytania. EN: the request body.
 */
export function toRequestBody(draft: Draft): NewSurveyBody {
  return {
    title: draft.title.trim(),
    durationDays: draft.durationDays,
    closesAt: draft.closesAt === '' ? null : draft.closesAt,
    questions: draft.questions.map((question) => ({
      prompt: question.prompt.trim(),
      type: question.type,
      options: question.options.map((option) => option.trim()).filter((option) => option !== ''),
    })),
  };
}
