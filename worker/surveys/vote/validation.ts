/**
 * PL: Sprawdzanie odpowiedzi ucznia: kształt danych z telefonu i zgodność z pytaniami ankiety (każde pytanie raz, odpowiedzi z tego pytania, a przy jednokrotnym wyborze i skali 1–5 jedna). Czysta logika bez bazy.
 *     Serwer nie ufa telefonowi (docs/STANDARD_KODU.md, część 6): sprawdza każde pole, zanim cokolwiek zapisze.
 * EN: Checking the student's answers: the shape of the data from the phone and the match with the survey questions (every question once, options of that question, and one option for a single choice or a 1–5 scale). Pure logic without the database.
 *     The server does not trust the phone (docs/STANDARD_KODU.md, part 6): it checks every field before writing anything.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/db/schema/surveys.ts::QUESTION_TYPES
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by worker/surveys/vote/validation.test.ts::checkAnswers
 */

// PL: Rodzaje pytań ze schematu, tylko jako typ (nic nie jest wykonywane).
// EN: The question types from the schema, as a type only (nothing is run).
import type { QUESTION_TYPES } from '../../db/schema/surveys';

// PL: Najwięcej odpowiedzi w jednym zapytaniu. Ankieta ma kilka pytań, więc 50 to duży zapas, a odcina śmieciowe zapytania.
// EN: The most answers in one request. A survey has a few questions, so 50 is a big margin, and it cuts off junk requests.
const MAX_ANSWERS = 50;

// PL: Najwięcej wybranych odpowiedzi w jednym pytaniu. Pytanie ma kilka odpowiedzi, więc 50 to duży zapas.
// EN: The most picked options in one question. A question has a few options, so 50 is a big margin.
const MAX_OPTIONS = 50;

// PL: Najdłuższy numer pytania albo odpowiedzi. Numery są krótkimi tekstami.
// EN: The longest question or option id. The ids are short texts.
const MAX_ID_LENGTH = 64;

/**
 * PL: Rodzaj pytania: jedna odpowiedź (jednokrotny wybór, skala 1–5) albo kilka. Z kolumny survey_questions.type.
 * EN: The question type: one answer (single choice, 1–5 scale) or several. From the survey_questions.type column.
 */
export type QuestionType = (typeof QUESTION_TYPES)[number];

/**
 * PL: Odpowiedź ucznia na jedno pytanie: które pytanie i które odpowiedzi wybrał.
 * EN: The student's answer to one question: which question and which options were picked.
 */
export type AnswerInput = {
  /** PL: Numer pytania. EN: The question id. */
  questionId: string;
  /** PL: Numery wybranych odpowiedzi. EN: The ids of the picked options. */
  optionIds: string[];
};

/**
 * PL: Pytanie ankiety z jego rodzajem i numerami odpowiedzi, do porównania z tym, co przysłał telefon.
 * EN: A survey question with its type and the ids of its options, to compare with what the phone sent.
 */
export type QuestionOptionIds = {
  /** PL: Numer pytania. EN: The question id. */
  questionId: string;
  /** PL: Rodzaj pytania: decyduje, ile odpowiedzi wolno wybrać. EN: The question type: it decides how many options may be picked. */
  type: QuestionType;
  /** PL: Numery odpowiedzi tego pytania. EN: The ids of this question's options. */
  optionIds: string[];
};

/**
 * PL: Wynik sprawdzenia: poprawne numery odpowiedzi do zapisania albo powód odrzucenia.
 * EN: The check result: the valid option ids to write, or the reason for rejection.
 */
export type AnswersCheck =
  | { ok: true; optionIds: string[] }
  | {
      ok: false;
      reason: 'missing_question' | 'unknown_question' | 'duplicate_question' | 'empty_answer' | 'too_many_options' | 'duplicate_option' | 'unknown_option';
    };

/**
 * PL: Sprawdza, czy tekst to krótki, niepusty numer.
 * EN: Checks whether a value is a short, non-empty id.
 *
 * @param value - PL: wartość z danych telefonu. EN: a value from the phone's data.
 * @returns PL: prawda, gdy to tekst od 1 do 64 znaków. EN: true when it is text of 1 to 64 characters.
 */
function isId(value: unknown): value is string {
  // PL: Tylko tekst o dopuszczalnej długości.
  // EN: Only text of an allowed length.
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_ID_LENGTH;
}

/**
 * PL: Zamienia dane z telefonu na listę odpowiedzi. Oczekiwany kształt: { answers: [{ questionId, optionIds: [...] }, ...] }. Pusta lista wyborów przechodzi tutaj, a odrzuca ją checkAnswers.
 * EN: Turns the data from the phone into a list of answers. Expected shape: { answers: [{ questionId, optionIds: [...] }, ...] }. An empty list of picks passes here, and checkAnswers rejects it.
 *
 * @param body - PL: odczytany JSON zapytania (dowolna wartość). EN: the parsed JSON of the request (any value).
 * @returns PL: lista odpowiedzi albo null, gdy kształt jest zły. EN: the list of answers, or null when the shape is wrong.
 */
export function parseAnswersBody(body: unknown): AnswerInput[] | null {
  // PL: Wymagamy obiektu z tablicą answers o rozsądnej długości.
  // EN: We require an object with an answers array of a sensible length.
  const answers = (body as { answers?: unknown } | null)?.answers;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS) return null;

  // PL: Każdy element musi mieć numer pytania i tablicę numerów odpowiedzi. Dodatkowe pola odrzucamy, nie zapisujemy ich nigdzie.
  // EN: Every element must have a question id and an array of option ids. We drop extra fields and store them nowhere.
  const parsed: AnswerInput[] = [];
  for (const item of answers) {
    const { questionId, optionIds } = (item ?? {}) as Record<string, unknown>;
    if (!isId(questionId) || !Array.isArray(optionIds) || optionIds.length > MAX_OPTIONS || !optionIds.every(isId)) return null;
    parsed.push({ questionId, optionIds });
  }
  return parsed;
}

/**
 * PL: Porównuje odpowiedzi z pytaniami ankiety: każde pytanie dokładnie raz, co najmniej jedna odpowiedź, każda z tego pytania, bez powtórzeń, a przy jednokrotnym wyborze i skali dokładnie jedna.
 * EN: Compares the answers with the survey questions: every question exactly once, at least one option, each from that question, without repeats, and exactly one for a single choice or a scale.
 *
 * @param questions - PL: pytania ankiety z rodzajem i numerami odpowiedzi. EN: the survey questions with their type and option ids.
 * @param answers - PL: odpowiedzi ucznia po parsowaniu. EN: the student's answers after parsing.
 * @returns PL: numery wybranych odpowiedzi (wszystkich pytań) albo powód odrzucenia. EN: the picked option ids of all questions, or the reason for rejection.
 */
export function checkAnswers(questions: QuestionOptionIds[], answers: AnswerInput[]): AnswersCheck {
  // PL: Mapa numer pytania → pytanie, do szybkiego sprawdzania.
  // EN: A question id → question map, for quick checks.
  const allowed = new Map(questions.map((question) => [question.questionId, question]));

  // PL: Przejdź po odpowiedziach i odrzuć pierwszą złą: nieznane pytanie, powtórzone pytanie, pustą odpowiedź, za dużo odpowiedzi w jednokrotnym wyborze, powtórzoną albo cudzą odpowiedź.
  // EN: Walk the answers and reject the first bad one: an unknown question, a repeated question, an empty answer, too many options for a single choice, a repeated or a foreign option.
  const seen = new Set<string>();
  const picked: string[] = [];
  for (const answer of answers) {
    const question = allowed.get(answer.questionId);
    if (question === undefined) return { ok: false, reason: 'unknown_question' };
    if (seen.has(answer.questionId)) return { ok: false, reason: 'duplicate_question' };
    seen.add(answer.questionId);

    if (answer.optionIds.length === 0) return { ok: false, reason: 'empty_answer' };
    // PL: Jednokrotny wybór i skala 1–5 przyjmują jedną odpowiedź. Wypisane wprost, żeby nowy typ nie dostał wielu odpowiedzi po cichu.
    // EN: A single choice and a 1–5 scale take one answer. Listed explicitly, so a new type does not get several answers silently.
    const isSingle = question.type === 'single_choice' || question.type === 'scale_1_5';
    if (isSingle && answer.optionIds.length > 1) return { ok: false, reason: 'too_many_options' };
    // PL: Zbiór wybranych musi mieć tyle samo elementów co lista, inaczej ten sam numer przyszedł dwa razy.
    // EN: The set of picked ids must have as many items as the list, otherwise the same id came twice.
    if (new Set(answer.optionIds).size !== answer.optionIds.length) return { ok: false, reason: 'duplicate_option' };

    const options = new Set(question.optionIds);
    if (!answer.optionIds.every((optionId) => options.has(optionId))) return { ok: false, reason: 'unknown_option' };
    picked.push(...answer.optionIds);
  }

  // PL: Każde pytanie ankiety musi mieć odpowiedź.
  // EN: Every survey question must have an answer.
  if (seen.size !== questions.length) return { ok: false, reason: 'missing_question' };
  return { ok: true, optionIds: picked };
}
