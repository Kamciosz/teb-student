/**
 * PL: Jedno pytanie ankiety na ekranie: numer pytania, treść, odpowiedzi z literami A–D (albo skala 1–5) i notatka o anonimowości (ekrany 4.2 i 4.3 w docs/projekt/EKRANY.md). Pytanie jednokrotnego wyboru ma pola radio, wielokrotnego wyboru pola wyboru, skala 1–5 przyciski (ScaleOptions). Sam niczego nie zapisuje, tylko zgłasza wybór wyżej.
 * EN: One survey question on the screen: the question number, the text, the options with letters A–D (or the 1–5 scale) and the anonymity note (screens 4.2 and 4.3 in docs/projekt/EKRANY.md). A single-choice question has radio inputs, a multiple-choice one has checkboxes, the 1–5 scale has buttons (ScaleOptions). It stores nothing itself, it only reports the choice upward.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// PL: Hak referencji i efektu Reacta.
// EN: React's ref and effect hooks.
import { useEffect, useRef } from 'react';
import { LockIcon } from './icons';
import { ScaleOptions } from './ScaleOptions';
import type { SurveyQuestion } from './types';

// PL: Litery odpowiedzi. Ankieta ma najwyżej tyle odpowiedzi, ile liter; kolejne dostałyby myślnik.
// EN: The option letters. A survey has at most as many options as letters; extra ones would get a dash.
const LETTERS = 'ABCDEFGH';

/** PL: Dane kroku z pytaniem. EN: The data of a question step. */
export type QuestionStepProps = {
  question: SurveyQuestion;
  /** PL: Numer pytania od 1. EN: The question number from 1. */
  number: number;
  /** PL: Numery wybranych odpowiedzi (pusta lista, gdy nic). EN: The chosen option ids (an empty list when none). */
  selectedIds: string[];
  /** PL: Zgłasza nowy zestaw wybranych odpowiedzi tego pytania. EN: Reports the new set of chosen options of this question. */
  onChange: (optionIds: string[]) => void;
};

/**
 * PL: Rysuje pytanie z odpowiedziami. Odpowiedzi to prawdziwe pola wyboru (radio albo checkbox), więc działają z klawiatury i z czytnikiem ekranu. Po zmianie pytania nagłówek dostaje fokus.
 * EN: Draws the question with its options. The options are real radio or checkbox inputs, so they work with the keyboard and a screen reader. After the question changes, the heading gets focus.
 *
 * @param props - PL: pytanie, numer, wybrane odpowiedzi i funkcja zmiany. EN: the question, the number, the chosen options and the change function.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function QuestionStep({ question, number, selectedIds, onChange }: QuestionStepProps) {
  // PL: Po przejściu do następnego pytania czytnik ekranu ma przeczytać nowe pytanie, więc przenosimy na nie fokus.
  // EN: After moving to the next question the screen reader must read the new question, so we move focus to it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [question.id]);

  // PL: Przy wielokrotnym wyborze klik dodaje albo usuwa odpowiedź z zestawu. Przy jednokrotnym wyborze i skali zostaje tylko kliknięta.
  // EN: With multiple choice a click adds or removes the option from the set. With single choice and the scale only the clicked option stays.
  const isMultiple = question.type === 'multiple_choice';
  const isScale = question.type === 'scale_1_5';
  function toggle(optionId: string) {
    if (!isMultiple) return onChange([optionId]);
    onChange(selectedIds.includes(optionId) ? selectedIds.filter((id) => id !== optionId) : [...selectedIds, optionId]);
  }

  return (
    <>
      <p className="vote-label">Pytanie {number}</p>
      <h1 ref={headingRef} tabIndex={-1}>
        {question.prompt}
      </h1>
      {isMultiple ? <p className="vote-small">Możesz zaznaczyć kilka odpowiedzi.</p> : null}
      {isScale ? (
        <ScaleOptions name={question.id} options={question.options} selectedIds={selectedIds} onPick={toggle} />
      ) : (
        <fieldset className="vote-options">
          <legend className="vote-sr-only">Odpowiedzi</legend>
          {question.options.map((option, index) => (
            <label key={option.id} className="vote-option">
              <input type={isMultiple ? 'checkbox' : 'radio'} name={question.id} value={option.id} checked={selectedIds.includes(option.id)} onChange={() => toggle(option.id)} />
              <span className="vote-option__body">
                <span className="vote-option__letter">{LETTERS[index] ?? '-'}</span>
                <span className="vote-option__text">{option.label}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <p className="vote-note">
        <LockIcon />
        <span>Odpowiedzi są anonimowe. Wyniki widzi tylko Samorząd.</span>
      </p>
    </>
  );
}
