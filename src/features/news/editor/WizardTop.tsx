/**
 * PL: Górny pasek kreatora wpisu (jak „flowTop” i „bars” w docs/projekt/EKRANY.md): strzałka powrotu, tytuł „Nowy wpis”, numer kroku „1/3” i pasek postępu z trzema odcinkami.
 * EN: The top bar of the entry wizard (like "flowTop" and "bars" in docs/projekt/EKRANY.md): the back arrow, the "Nowy wpis" title, the step number "1/3" and the progress bar with three segments.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/texts.ts::SCREEN
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::WizardTop
 */

import { Link } from 'react-router';
import { SCREEN, TO_AGREE } from './texts';

// PL: Liczba kroków kreatora: typ, treść, podgląd.
// EN: The number of wizard steps: type, content, preview.
const STEPS = [1, 2, 3];

/**
 * PL: Dane paska.
 * EN: Bar data.
 */
export type WizardTopProps = {
  /** PL: Numer kroku, 1 do 3. EN: The step number, 1 to 3. */
  step: number;
  /** PL: Wywoływane po strzałce w krokach 2 i 3 (krok wstecz). EN: Called after the arrow in steps 2 and 3 (one step back). */
  onBack: () => void;
};

/**
 * PL: Rysuje pasek. W kroku 1 strzałka wraca do panelu wpisów, w pozostałych o krok wstecz.
 * EN: Draws the bar. In step 1 the arrow returns to the entries panel, in the others one step back.
 *
 * @param props - PL: krok i funkcja powrotu. EN: the step and the back function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function WizardTop({ step, onBack }: WizardTopProps) {
  return (
    <header className="editor-top">
      <div className="editor-top__row">
        {/* PL: Strzałka powrotu. Pole dotyku 44 × 44 px. EN: The back arrow. A 44 × 44 px touch area. */}
        {step === 1 ? (
          <Link className="editor-top__back" to="/news/admin" aria-label={TO_AGREE.back}>
            <span aria-hidden="true">←</span>
          </Link>
        ) : (
          <button type="button" className="editor-top__back" aria-label={TO_AGREE.back} onClick={onBack}>
            <span aria-hidden="true">←</span>
          </button>
        )}
        <p className="editor-top__title">{SCREEN.title}</p>
        <p className="editor-top__step">{step}/3</p>
      </div>
      {/* PL: Pasek postępu: odcinki do bieżącego kroku są wypełnione. EN: The progress bar: the segments up to the current step are filled. */}
      <div className="editor-progress" role="progressbar" aria-label={TO_AGREE.stepOf(step)} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
        {STEPS.map((number) => (
          <span key={number} className={number <= step ? 'editor-progress__bar editor-progress__bar--on' : 'editor-progress__bar'} />
        ))}
      </div>
    </header>
  );
}
