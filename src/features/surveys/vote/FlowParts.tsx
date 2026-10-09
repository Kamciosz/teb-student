/**
 * PL: Części wspólne ekranów ankiety w trakcie wypełniania: górny pasek z przyciskiem „Wstecz”, tytułem i krokiem „1/3”, pasek postępu oraz komunikat zamiast pytań.
 * EN: The parts shared by the survey screens during filling in: the top bar with the "Wstecz" button, the title and the "1/3" step, the progress bar and the message in place of the questions.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// PL: Link bez przeładowania strony.
// EN: A link without reloading the page.
import { Link } from 'react-router';
import { ArrowLeftIcon } from './icons';

/** PL: Dane górnego paska. EN: The data of the top bar. */
export type FlowTopProps = {
  title: string;
  /** PL: Numer kroku od 1. EN: The step number from 1. */
  step: number;
  total: number;
  /** PL: Co robi „Wstecz” na pierwszym kroku: null oznacza powrót do poprzedniego pytania przez onBack. EN: What "Wstecz" does on the first step: null means going back to the previous question through onBack. */
  onBack: (() => void) | null;
};

/**
 * PL: Rysuje górny pasek: „Wstecz”, tytuł ankiety, „krok/razem” i pasek postępu. Na pierwszym kroku „Wstecz” prowadzi do listy, na kolejnych do poprzedniego pytania.
 * EN: Draws the top bar: "Wstecz", the survey title, "step/total" and the progress bar. On the first step "Wstecz" leads to the list, on later steps to the previous question.
 *
 * @param props - PL: tytuł, krok, liczba kroków i funkcja powrotu. EN: the title, the step, the number of steps and the back function.
 * @returns PL: drzewo elementów paska. EN: the tree of bar elements.
 */
export function FlowTop({ title, step, total, onBack }: FlowTopProps) {
  return (
    <header className="vote-top">
      <div className="vote-top__row">
        {onBack === null ? (
          <Link className="vote-icon-button" to="/surveys/vote" aria-label="Wstecz, do listy ankiet">
            <ArrowLeftIcon />
          </Link>
        ) : (
          <button type="button" className="vote-icon-button" onClick={onBack} aria-label="Wstecz, do poprzedniego pytania">
            <ArrowLeftIcon />
          </button>
        )}
        <p className="vote-top__title">{title}</p>
        <p className="vote-top__step">
          {step}/{total}
        </p>
      </div>
      <div className="vote-bars" role="progressbar" aria-label="Postęp ankiety" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step}>
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={index < step ? 'vote-bars__bar vote-bars__bar--on' : 'vote-bars__bar'} />
        ))}
      </div>
    </header>
  );
}

/**
 * PL: Rysuje komunikat zamiast pytań (ankieta zakończona, już wypełniona, nie znaleziona albo błąd) z linkiem do listy.
 * EN: Draws a message in place of the questions (survey ended, already filled in, not found or an error) with a link to the list.
 *
 * @param props - PL: tytuł, treść komunikatu i opcjonalne ponowienie. EN: the title, the text of the message and an optional retry.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function FlowNotice({ title, text, onRetry }: { title: string; text: string; onRetry?: () => void }) {
  return (
    <main className="vote vote--flow vote--center" data-subtrack="5a">
      <div className="vote-done">
        <h1>{title}</h1>
        <p className="vote-lead">{text}</p>
      </div>
      <div className="vote-footer">
        {onRetry === undefined ? null : (
          <button type="button" className="vote-button vote-button--outline" onClick={onRetry}>
            Spróbuj ponownie
          </button>
        )}
        <Link className="vote-button vote-button--primary" to="/surveys/vote">
          Wróć do listy ankiet
        </Link>
      </div>
    </main>
  );
}
