/**
 * PL: Test szkicu nowej ankiety (podtor 5b): limity odpowiedzi (od 2 do 5) i pytań, teksty błędów z EKRANY.md, termin zamknięcia (brak terminu, w przyszłości, w przeszłości, po ostatnim dniu) oraz treść zapytania bez pustych odpowiedzi.
 * EN: Test of the new survey draft (subtrack 5b): the option limits (2 to 5) and the question limit, the error texts from EKRANY.md, the closing time (no time, in the future, in the past, after the last day) and the request body without blank options.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/draft.ts::validateDraft
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { addOption, addQuestion, hasErrors, MAX_OPTIONS, MAX_QUESTIONS, newDraft, removeOption, removeQuestion, toRequestBody, updateQuestion, validateDraft } from './draft';

// PL: Chwila sprawdzania w teście: 13.10.2026 o 12:00 w Warszawie (10:00 UTC, czas letni). Ankieta 7-dniowa kończy się 20.10.
// EN: The moment of the check in the test: 13.10.2026 at 12:00 in Warsaw (10:00 UTC, summer time). A 7-day survey ends on 20.10.
const now = new Date('2026-10-13T10:00:00Z');

// PL: Poprawny szkic z tytułem i jednym pytaniem, bez terminu zamknięcia.
// EN: A valid draft with a title and one question, without a closing time.
const valid = updateQuestion({ ...newDraft(), title: 'T' }, 1, (question) => ({ ...question, prompt: 'P', options: ['A', 'B'] }));

describe('limity / limits', () => {
  it('odpowiedzi: od 2 do 5 / options: 2 to 5', () => {
    let question = newDraft().questions[0]!;
    expect(removeOption(question, 0).options).toHaveLength(2);
    for (let count = 0; count < 10; count += 1) question = addOption(question);
    expect(question.options).toHaveLength(MAX_OPTIONS);
    expect(removeOption(question, 0).options).toHaveLength(MAX_OPTIONS - 1);
  });

  it('pytań jest od 1 do 10 / there are 1 to 10 questions', () => {
    let draft = newDraft();
    expect(removeQuestion(draft, 1).questions).toHaveLength(1);
    for (let count = 0; count < 20; count += 1) draft = addQuestion(draft);
    expect(draft.questions).toHaveLength(MAX_QUESTIONS);
    expect(new Set(draft.questions.map((question) => question.key)).size).toBe(MAX_QUESTIONS);
  });
});

describe('sprawdzanie / validation', () => {
  it('pusty szkic ma trzy błędy z tekstami z EKRANY.md / an empty draft has three errors with the texts from EKRANY.md', () => {
    const errors = validateDraft(newDraft(), now);
    expect(errors.title).toBe('Wpisz tytuł ankiety.');
    expect(errors.questions.get(1)).toEqual({ prompt: 'Wpisz pytanie.', options: 'Dodaj co najmniej dwie odpowiedzi.' });
    expect(hasErrors(errors)).toBe(true);
  });

  it('dwa puste wiersze to nie dwie odpowiedzi, a spacje to nie tekst / two blank rows are not two options, and spaces are not text', () => {
    const draft = updateQuestion({ ...newDraft(), title: 'T' }, 1, (question) => ({ ...question, prompt: 'P', options: ['A', '  '] }));
    expect(validateDraft(draft, now).questions.get(1)?.options).toBe('Dodaj co najmniej dwie odpowiedzi.');
  });

  it('poprawny szkic nie ma błędów, a treść zapytania pomija puste odpowiedzi / a valid draft has no errors, and the request body skips blank options', () => {
    const base = { ...newDraft(), title: ' Dzień sportu ' };
    const draft = updateQuestion(base, 1, (question) => ({ ...question, prompt: ' W co zagrać? ', options: ['Siatkówka', '', 'Koszykówka'] }));
    expect(hasErrors(validateDraft(draft, now))).toBe(false);
    expect(toRequestBody(draft)).toEqual({ title: 'Dzień sportu', durationDays: 7, questions: [{ prompt: 'W co zagrać?', type: 'single_choice', options: ['Siatkówka', 'Koszykówka'] }], closesAt: null });
  });

  it('nowe pytanie to jeden wybór, a wybrany typ idzie do treści zapytania / a new question is single choice, and the chosen type goes into the request body', () => {
    // PL: Dodane pytanie dostaje domyślny typ, a zmieniony typ trafia do treści zapytania.
    // EN: The added question gets the default type, and the changed type goes into the request body.
    const added = addQuestion({ ...newDraft(), title: 'T' });
    expect(added.questions[1]?.type).toBe('single_choice');
    const draft = updateQuestion(added, 2, (question) => ({ ...question, prompt: 'P', type: 'multiple_choice', options: ['A', 'B'] }));
    expect(toRequestBody(draft).questions.map((question) => question.type)).toEqual(['single_choice', 'multiple_choice']);
  });
});

describe('termin zamknięcia / closing time', () => {
  it('pusty termin to brak terminu i nie daje błędu / an empty closing time means no closing time and gives no error', () => {
    expect(validateDraft(valid, now).closesAt).toBeNull();
    expect(toRequestBody(valid).closesAt).toBeNull();
  });

  it('termin w przyszłości przechodzi do treści zapytania / a future closing time goes into the request body', () => {
    const draft = { ...valid, closesAt: '2026-10-20T12:00' };
    expect(validateDraft(draft, now).closesAt).toBeNull();
    expect(toRequestBody(draft).closesAt).toBe('2026-10-20T12:00');
  });

  it('termin w przeszłości, także o minutę, daje błąd / a time in the past, even by one minute, gives an error', () => {
    // PL: 13.10.2026 o 11:59 w Warszawie już minęło, a 12:00 to już nie przyszłość.
    // EN: 13.10.2026 at 11:59 in Warsaw has already passed, and 12:00 is no longer the future.
    expect(validateDraft({ ...valid, closesAt: '2026-10-13T11:59' }, now).closesAt).toBe('Termin musi być w przyszłości.');
    expect(validateDraft({ ...valid, closesAt: '2026-10-13T12:00' }, now).closesAt).toBe('Termin musi być w przyszłości.');
    expect(hasErrors(validateDraft({ ...valid, closesAt: '2026-10-13T11:59' }, now))).toBe(true);
  });

  it('termin po ostatnim dniu ankiety daje błąd / a time after the last day of the survey gives an error', () => {
    // PL: 7 dni od 13.10 to ostatni dzień 20.10, więc 21.10 jest za późno.
    // EN: 7 days from 13.10 end on 20.10, so 21.10 is too late.
    expect(validateDraft({ ...valid, closesAt: '2026-10-21T09:00' }, now).closesAt).toBe('Termin nie może być później niż ostatni dzień ankiety.');
  });
});

// PL: Skala 1–5 ma stałe odpowiedzi, więc brak wierszy odpowiedzi nie jest błędem, a treść zapytania dostaje „1”…„5”.
// EN: The 1–5 scale has fixed options, so having no option rows is not an error, and the request body gets "1"…"5".
describe('skala 1–5 / the 1–5 scale', () => {
  const scale = updateQuestion({ ...newDraft(), title: 'T' }, 1, (question) => ({ ...question, prompt: 'P', type: 'scale_1_5', options: [] }));

  it('bez odpowiedzi nie daje błędu / without options it gives no error', () => {
    expect(hasErrors(validateDraft(scale, now))).toBe(false);
  });

  it('wysyła odpowiedzi 1…5 niezależnie od szkicu / sends the options 1…5 whatever the draft has', () => {
    expect(toRequestBody(scale).questions).toEqual([{ prompt: 'P', type: 'scale_1_5', options: ['1', '2', '3', '4', '5'] }]);
  });
});

// PL: Krótka odpowiedź nie ma odpowiedzi do wyboru, więc szkic bez nich jest poprawny, a ciało zapytania wysyła pustą listę.
// EN: A short answer has no options to pick, so a draft without them is valid, and the request body sends an empty list.
describe('krótka odpowiedź / short answer', () => {
  const shortText = updateQuestion({ ...newDraft(), title: 'T' }, 1, (question) => ({ ...question, prompt: 'P', type: 'short_text', options: [] }));

  it('bez odpowiedzi nie daje błędu / without options it gives no error', () => {
    expect(hasErrors(validateDraft(shortText, now))).toBe(false);
  });

  it('wysyła pustą listę odpowiedzi / sends an empty list of options', () => {
    expect(toRequestBody(shortText).questions).toEqual([{ prompt: 'P', type: 'short_text', options: [] }]);
  });
});
