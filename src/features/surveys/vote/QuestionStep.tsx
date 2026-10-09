/**
 * PL: Jedno pytanie ankiety na ekranie: numer pytania, treść, odpowiedzi z literami A–D i notatka o anonimowości (ekrany 4.2 i 4.3 w docs/projekt/EKRANY.md). Sam niczego nie zapisuje, tylko zgłasza wybór wyżej.
 * EN: One survey question on the screen: the question number, the text, the options with letters A–D and the anonymity note (screens 4.2 and 4.3 in docs/projekt/EKRANY.md). It stores nothing itself, it only reports the choice upward.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// PL: Hak referencji i efektu Reacta.
// EN: React's ref and effect hooks.
import { useEffect, useRef } from 'react';
import { LockIcon } from './icons';
import type { SurveyQuestion } from './types';

// PL: Litery odpowiedzi. Ankieta ma najwyżej tyle odpowiedzi, ile liter; kolejne dostałyby myślnik.
// EN: The option letters. A survey has at most as many options as letters; extra ones would get a dash.
const LETTERS = 'ABCDEFGH';

/** PL: Dane kroku z pytaniem. EN: The data of a question step. */
export type QuestionStepProps = {
  question: SurveyQuestion;
  /** PL: Numer pytania od 1. EN: The question number from 1. */
  number: number;
  /** PL: Numer wybranej odpowiedzi albo undefined. EN: The chosen option id or undefined. */
  selectedId: string | undefined;
  onSelect: (optionId: string) => void;
};

/**
 * PL: Rysuje pytanie z odpowiedziami. Odpowiedzi to prawdziwe pola wyboru, więc działają z klawiatury i z czytnikiem ekranu. Po zmianie pytania nagłówek dostaje fokus.
 * EN: Draws the question with its options. The options are real radio inputs, so they work with the keyboard and a screen reader. After the question changes, the heading gets focus.
 *
 * @param props - PL: pytanie, numer, wybór i funkcja wyboru. EN: the question, the number, the choice and the choose function.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function QuestionStep({ question, number, selectedId, onSelect }: QuestionStepProps) {
  // PL: Po przejściu do następnego pytania czytnik ekranu ma przeczytać nowe pytanie, więc przenosimy na nie fokus.
  // EN: After moving to the next question the screen reader must read the new question, so we move focus to it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [question.id]);

  return (
    <>
      <p className="vote-label">Pytanie {number}</p>
      <h1 ref={headingRef} tabIndex={-1}>
        {question.prompt}
      </h1>
      <fieldset className="vote-options">
        <legend className="vote-sr-only">Odpowiedzi</legend>
        {question.options.map((option, index) => (
          <label key={option.id} className="vote-option">
            <input type="radio" name={question.id} value={option.id} checked={selectedId === option.id} onChange={() => onSelect(option.id)} />
            <span className="vote-option__body">
              <span className="vote-option__letter">{LETTERS[index] ?? '-'}</span>
              <span className="vote-option__text">{option.label}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="vote-note">
        <LockIcon />
        <span>Odpowiedzi są anonimowe. Wyniki widzi tylko Samorząd.</span>
      </p>
    </>
  );
}
