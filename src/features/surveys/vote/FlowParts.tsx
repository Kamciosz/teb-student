/**
 * PL: Części wspólne ekranów ankiety w trakcie wypełniania: pasek nagłówka z „Wstecz”, tytułem i krokiem „2 z 5”, pasek postępu oraz komunikat zamiast pytań.
 * EN: The parts shared by the survey screens during filling in: the header bar with "Wstecz", the title and the step "2 z 5", the progress bar and the message in place of the questions.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ProgressBar
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 */

// PL: Link bez przeładowania strony.
// EN: A link without reloading the page.
import { Link } from 'react-router';
// PL: Przycisk i pasek postępu ze wspólnych klocków.
// EN: The button and the progress bar from the shared pieces.
import { Button, ProgressBar } from '../../../shared';
import { ArrowLeftIcon } from './icons';

/** PL: Dane górnego paska. EN: The data of the top bar. */
export type FlowTopProps = {
  title: string;
  /** PL: Numer kroku od 1. EN: The step number from 1. */
  step: number;
  total: number;
  /** PL: Co robi „Wstecz” na pierwszym kroku: null oznacza powrót do listy, a funkcja powrót do poprzedniego pytania. EN: What "Wstecz" does on the first step: null means going back to the list, a function means going back to the previous question. */
  onBack: (() => void) | null;
};

/**
 * PL: Rysuje pasek nagłówka: „Wstecz”, tytuł ankiety, „krok z razem” i pasek postępu. Na pierwszym kroku „Wstecz” prowadzi do listy, na kolejnych do poprzedniego pytania.
 * EN: Draws the header bar: "Wstecz", the survey title, "step z total" and the progress bar. On the first step "Wstecz" leads to the list, on later steps to the previous question.
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
        <p className="vote-top__step">{`${step} z ${total}`}</p>
      </div>
      <ProgressBar value={step} max={total} label="Postęp ankiety" className="vote-top__bar" />
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
          <Button variant="plain" onClick={onRetry}>
            Spróbuj ponownie
          </Button>
        )}
        <Link className="ui-button ui-button--filled" to="/surveys/vote">
          Wróć do listy ankiet
        </Link>
      </div>
    </main>
  );
}
