/**
 * PL: Sprawdzanie odpowiedzi ucznia: kształt danych z telefonu i zgodność z pytaniami ankiety (każde pytanie raz, odpowiedź z tego pytania). Czysta logika bez bazy.
 *     Serwer nie ufa telefonowi (docs/STANDARD_KODU.md, część 6): sprawdza każde pole, zanim cokolwiek zapisze.
 * EN: Checking the student's answers: the shape of the data from the phone and the match with the survey questions (every question once, an option of that question). Pure logic without the database.
 *     The server does not trust the phone (docs/STANDARD_KODU.md, part 6): it checks every field before writing anything.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by worker/surveys/vote/routes.ts::surveysVoteApp
 * @used_by worker/surveys/vote/validation.test.ts::checkAnswers
 */

// PL: Najwięcej odpowiedzi w jednym zapytaniu. Ankieta ma kilka pytań, więc 50 to duży zapas, a odcina śmieciowe zapytania.
// EN: The most answers in one request. A survey has a few questions, so 50 is a big margin, and it cuts off junk requests.
const MAX_ANSWERS = 50;

// PL: Najdłuższy numer pytania albo odpowiedzi. Numery są krótkimi tekstami.
// EN: The longest question or option id. The ids are short texts.
const MAX_ID_LENGTH = 64;

/**
 * PL: Jedna odpowiedź ucznia: które pytanie i którą odpowiedź wybrał.
 * EN: One answer of the student: which question and which option was picked.
 */
export type AnswerInput = {
  /** PL: Numer pytania. EN: The question id. */
  questionId: string;
  /** PL: Numer wybranej odpowiedzi. EN: The id of the picked option. */
  optionId: string;
};

/**
 * PL: Pytanie ankiety z numerami jego odpowiedzi, do porównania z tym, co przysłał telefon.
 * EN: A survey question with the ids of its options, to compare with what the phone sent.
 */
export type QuestionOptionIds = {
  /** PL: Numer pytania. EN: The question id. */
  questionId: string;
  /** PL: Numery odpowiedzi tego pytania. EN: The ids of this question's options. */
  optionIds: string[];
};

/**
 * PL: Wynik sprawdzenia: poprawne numery odpowiedzi do zapisania albo powód odrzucenia.
 * EN: The check result: the valid option ids to write, or the reason for rejection.
 */
export type AnswersCheck =
  | { ok: true; optionIds: string[] }
  | { ok: false; reason: 'missing_question' | 'unknown_question' | 'duplicate_question' | 'unknown_option' };

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
 * PL: Zamienia dane z telefonu na listę odpowiedzi. Oczekiwany kształt: { answers: [{ questionId, optionId }, ...] }.
 * EN: Turns the data from the phone into a list of answers. Expected shape: { answers: [{ questionId, optionId }, ...] }.
 *
 * @param body - PL: odczytany JSON zapytania (dowolna wartość). EN: the parsed JSON of the request (any value).
 * @returns PL: lista odpowiedzi albo null, gdy kształt jest zły. EN: the list of answers, or null when the shape is wrong.
 */
export function parseAnswersBody(body: unknown): AnswerInput[] | null {
  // PL: Wymagamy obiektu z tablicą answers o rozsądnej długości.
  // EN: We require an object with an answers array of a sensible length.
  const answers = (body as { answers?: unknown } | null)?.answers;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS) return null;

  // PL: Każdy element musi mieć oba numery. Dodatkowe pola odrzucamy, nie zapisujemy ich nigdzie.
  // EN: Every element must have both ids. We drop extra fields and store them nowhere.
  const parsed: AnswerInput[] = [];
  for (const item of answers) {
    const { questionId, optionId } = (item ?? {}) as Record<string, unknown>;
    if (!isId(questionId) || !isId(optionId)) return null;
    parsed.push({ questionId, optionId });
  }
  return parsed;
}

/**
 * PL: Porównuje odpowiedzi z pytaniami ankiety: każde pytanie dokładnie raz i odpowiedź należy do swojego pytania.
 * EN: Compares the answers with the survey questions: every question exactly once and the option belongs to its question.
 *
 * @param questions - PL: pytania ankiety z numerami odpowiedzi. EN: the survey questions with option ids.
 * @param answers - PL: odpowiedzi ucznia po parsowaniu. EN: the student's answers after parsing.
 * @returns PL: numery wybranych odpowiedzi albo powód odrzucenia. EN: the picked option ids, or the reason for rejection.
 */
export function checkAnswers(questions: QuestionOptionIds[], answers: AnswerInput[]): AnswersCheck {
  // PL: Mapa pytanie → dozwolone odpowiedzi, do szybkiego sprawdzania.
  // EN: A question → allowed options map, for quick checks.
  const allowed = new Map(questions.map((question) => [question.questionId, new Set(question.optionIds)]));

  // PL: Przejdź po odpowiedziach i odrzuć pierwszą złą: nieznane pytanie, powtórzone pytanie albo cudza odpowiedź.
  // EN: Walk the answers and reject the first bad one: an unknown question, a repeated question or a foreign option.
  const seen = new Set<string>();
  for (const answer of answers) {
    const options = allowed.get(answer.questionId);
    if (options === undefined) return { ok: false, reason: 'unknown_question' };
    if (seen.has(answer.questionId)) return { ok: false, reason: 'duplicate_question' };
    if (!options.has(answer.optionId)) return { ok: false, reason: 'unknown_option' };
    seen.add(answer.questionId);
  }

  // PL: Każde pytanie ankiety musi mieć odpowiedź.
  // EN: Every survey question must have an answer.
  if (seen.size !== questions.length) return { ok: false, reason: 'missing_question' };
  return { ok: true, optionIds: answers.map((answer) => answer.optionId) };
}
