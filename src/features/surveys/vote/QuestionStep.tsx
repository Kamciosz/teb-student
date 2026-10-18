/**
 * PL: Jedno pytanie ankiety na ekranie: numer pytania, treść, odpowiedzi jako wiersze listy (albo skala 1–5, albo pole krótkiej odpowiedzi) i notatka o anonimowości (ekrany 4.2 i 4.3 w docs/projekt/EKRANY.md). Pytanie jednokrotnego wyboru ma pola radio, wielokrotnego wyboru pola wyboru, skala 1–5 przyciski (ScaleOptions), krótka odpowiedź pole tekstowe z podpowiedzią o anonimowości pod spodem i licznikiem znaków. Sam niczego nie zapisuje, tylko zgłasza wybór wyżej.
 * EN: One survey question on the screen: the question number, the text, the options as the rows of a list (or the 1–5 scale, or the short-answer field) and the anonymity note (screens 4.2 and 4.3 in docs/projekt/EKRANY.md). A single-choice question has radio inputs, a multiple-choice one has checkboxes, the 1–5 scale has buttons (ScaleOptions), a short answer is a text field with the anonymity hint under it and a character counter. It stores nothing itself, it only reports the choice upward.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/shortText.ts::countShortTextCharacters
 * @uses src/features/surveys/vote/shortText.ts::cleanShortText
 * @uses src/features/surveys/vote/shortText.ts::SHORT_TEXT_MAX_LENGTH
 * @uses src/features/surveys/vote/texts.ts::TEXTS
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 * @used_by src/features/surveys/vote/QuestionStep.test.tsx::QuestionStep
 */

// PL: Haki referencji, efektu i identyfikatorów Reacta.
// EN: React's ref, effect and id hooks.
import { useEffect, useId, useRef } from 'react';
import { CheckIcon, LockIcon } from './icons';
import { ScaleOptions } from './ScaleOptions';
import { cleanShortText, countShortTextCharacters, SHORT_TEXT_MAX_LENGTH } from './shortText';
import { TEXTS } from './texts';
import type { SurveyQuestion } from './types';

/** PL: Dane kroku z pytaniem. EN: The data of a question step. */
export type QuestionStepProps = {
  question: SurveyQuestion;
  /** PL: Numer pytania od 1. EN: The question number from 1. */
  number: number;
  /** PL: Numery wybranych odpowiedzi (pusta lista, gdy nic). EN: The chosen option ids (an empty list when none). */
  selectedIds: string[];
  /** PL: Zgłasza nowy zestaw wybranych odpowiedzi tego pytania. EN: Reports the new set of chosen options of this question. */
  onChange: (optionIds: string[]) => void;
  /** PL: Wpisany tekst krótkiej odpowiedzi (pusty, dopóki nic nie wpisano). EN: The typed short answer (empty until something is typed). */
  text: string;
  /** PL: Zgłasza nowy tekst krótkiej odpowiedzi tego pytania. EN: Reports the new short-answer text of this question. */
  onTextChange: (text: string) => void;
};

/**
 * PL: Rysuje pytanie z odpowiedziami. Odpowiedzi to prawdziwe pola wyboru (radio albo checkbox), więc działają z klawiatury i z czytnikiem ekranu. Krótka odpowiedź to pole tekstowe z licznikiem „x / 200 znaków”, liczonym tak samo jak na serwerze. Po zmianie pytania nagłówek dostaje fokus.
 * EN: Draws the question with its options. The options are real radio or checkbox inputs, so they work with the keyboard and a screen reader. A short answer is a text field with a "x / 200 characters" counter, counted the same way as on the server. After the question changes, the heading gets focus.
 *
 * @param props - PL: pytanie, numer, wybrane odpowiedzi, tekst i funkcje zmiany. EN: the question, the number, the chosen options, the text and the change functions.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function QuestionStep({ question, number, selectedIds, onChange, text, onTextChange }: QuestionStepProps) {
  // PL: Po przejściu do następnego pytania czytnik ekranu ma przeczytać nowe pytanie, więc przenosimy na nie fokus.
  // EN: After moving to the next question the screen reader must read the new question, so we move focus to it.
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [question.id]);

  // PL: Identyfikatory pola i licznika, żeby etykieta i licznik były przypięte do pola.
  // EN: The ids of the field and the counter, so the label and the counter are tied to the field.
  const inputId = useId();
  const counterId = useId();
  // PL: Identyfikator podpowiedzi o anonimowości, żeby pole ją czytało razem z licznikiem.
  // EN: The id of the anonymity hint, so the field reads it together with the counter.
  const hintId = useId();

  // PL: Przy wielokrotnym wyborze klik dodaje albo usuwa odpowiedź z zestawu. Przy jednokrotnym wyborze i skali zostaje tylko kliknięta.
  // EN: With multiple choice a click adds or removes the option from the set. With single choice and the scale only the clicked option stays.
  const isMultiple = question.type === 'multiple_choice';
  const isScale = question.type === 'scale_1_5';
  const isShortText = question.type === 'short_text';
  function toggle(optionId: string) {
    if (!isMultiple) return onChange([optionId]);
    onChange(selectedIds.includes(optionId) ? selectedIds.filter((id) => id !== optionId) : [...selectedIds, optionId]);
  }

  // PL: Licznik liczy przycięty tekst, tak jak serwer. Za długi tekst nie da się wysłać, więc pokazujemy podpowiedź.
  // EN: The counter counts the trimmed text, as the server does. A text that is too long cannot be sent, so we show a hint.
  const length = countShortTextCharacters(cleanShortText(text));
  const tooLong = length > SHORT_TEXT_MAX_LENGTH;

  return (
    <>
      <p className="vote-label">Pytanie {number}</p>
      <h1 ref={headingRef} tabIndex={-1} className="vote-question">
        {question.prompt}
      </h1>
      {isMultiple ? <p className="vote-small">Możesz zaznaczyć kilka odpowiedzi.</p> : null}
      {isShortText ? (
        <div className="vote-text">
          <label className="vote-sr-only" htmlFor={inputId}>
            {TEXTS.shortTextLabel}
          </label>
          <textarea id={inputId} className="vote-text__input" rows={4} value={text} onChange={(event) => onTextChange(event.target.value)} aria-describedby={`${hintId} ${counterId}`} />
          <p id={hintId} className="vote-small">
            {TEXTS.shortTextHint}
          </p>
          <div className="vote-text__meta">
            {tooLong ? <span className="vote-small">{TEXTS.shortTextTooLong}</span> : null}
            <span id={counterId} className="vote-counter">
              {length} / {SHORT_TEXT_MAX_LENGTH} znaków
            </span>
          </div>
        </div>
      ) : isScale ? (
        <ScaleOptions name={question.id} options={question.options} selectedIds={selectedIds} onPick={toggle} />
      ) : (
        <fieldset className="vote-options">
          <legend className="vote-sr-only">Odpowiedzi</legend>
          {question.options.map((option) => {
            const isChosen = selectedIds.includes(option.id);
            return (
              <label key={option.id} className="vote-option">
                <input type={isMultiple ? 'checkbox' : 'radio'} name={question.id} value={option.id} checked={isChosen} onChange={() => toggle(option.id)} />
                <span className="vote-option__body">
                  <span className="vote-option__text">{option.label}</span>
                  {isChosen ? (
                    <span className="vote-option__mark">
                      <CheckIcon size={20} />
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>
      )}
      <p className="vote-note">
        <LockIcon />
        <span>Odpowiedzi są anonimowe. Wyniki widzi tylko Samorząd.</span>
      </p>
    </>
  );
}
