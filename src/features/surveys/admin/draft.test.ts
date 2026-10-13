/**
 * PL: Test szkicu nowej ankiety (podtor 5b): limity odpowiedzi (od 2 do 5) i pytań, teksty błędów z EKRANY.md oraz treść zapytania bez pustych odpowiedzi.
 * EN: Test of the new survey draft (subtrack 5b): the option limits (2 to 5) and the question limit, the error texts from EKRANY.md and the request body without blank options.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/draft.ts::validateDraft
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { addOption, addQuestion, hasErrors, MAX_OPTIONS, MAX_QUESTIONS, newDraft, removeOption, removeQuestion, toRequestBody, updateQuestion, validateDraft } from './draft';

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
    const errors = validateDraft(newDraft());
    expect(errors.title).toBe('Wpisz tytuł ankiety.');
    expect(errors.questions.get(1)).toEqual({ prompt: 'Wpisz pytanie.', options: 'Dodaj co najmniej dwie odpowiedzi.' });
    expect(hasErrors(errors)).toBe(true);
  });

  it('dwa puste wiersze to nie dwie odpowiedzi, a spacje to nie tekst / two blank rows are not two options, and spaces are not text', () => {
    const draft = updateQuestion({ ...newDraft(), title: 'T' }, 1, (question) => ({ ...question, prompt: 'P', options: ['A', '  '] }));
    expect(validateDraft(draft).questions.get(1)?.options).toBe('Dodaj co najmniej dwie odpowiedzi.');
  });

  it('poprawny szkic nie ma błędów, a treść zapytania pomija puste odpowiedzi / a valid draft has no errors, and the request body skips blank options', () => {
    const base = { ...newDraft(), title: ' Dzień sportu ' };
    const draft = updateQuestion(base, 1, (question) => ({ ...question, prompt: ' W co zagrać? ', options: ['Siatkówka', '', 'Koszykówka'] }));
    expect(hasErrors(validateDraft(draft))).toBe(false);
    expect(toRequestBody(draft)).toEqual({ title: 'Dzień sportu', durationDays: 7, questions: [{ prompt: 'W co zagrać?', options: ['Siatkówka', 'Koszykówka'] }] });
  });
});
