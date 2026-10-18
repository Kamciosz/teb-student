/**
 * PL: Górny pasek kreatora wpisu. W kroku 1 to ScreenHeader z „Wpisy” do listy wpisów. W krokach 2 i 3 to ten sam pasek z przyciskiem „Wstecz” o krok wstecz, bo ScreenHeader nie ma wywołania zwrotnego. Pod nim pasek postępu z trzema odcinkami i numer kroku.
 * EN: The top bar of the entry wizard. In step 1 it is a ScreenHeader with "Wpisy" back to the entries list. In steps 2 and 3 it is the same bar with a "Wstecz" button that goes one step back, because ScreenHeader has no callback. Under it the progress bar with three segments and the step number.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/features/news/editor/texts.ts::SCREEN
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::WizardTop
 */

import { ScreenHeader } from '../../../shared';
import { SCREEN, TEXTS } from './texts';

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
  /** PL: Wywoływane po „Wstecz” w krokach 2 i 3 (krok wstecz). EN: Called after "Wstecz" in steps 2 and 3 (one step back). */
  onBack: () => void;
};

/**
 * PL: Rysuje pasek. W kroku 1 „Wpisy” wraca do listy wpisów, w pozostałych o krok wstecz.
 * EN: Draws the bar. In step 1 "Wpisy" returns to the entries list, in the others it goes one step back.
 *
 * @param props - PL: krok i funkcja powrotu. EN: the step and the back function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function WizardTop({ step, onBack }: WizardTopProps) {
  return (
    <div className="editor-top">
      {step === 1 ? (
        <ScreenHeader title={SCREEN.title} backTo="/news/admin" backLabel={TEXTS.back} />
      ) : (
        <header className="ui-screen-header ui-screen-header--bar">
          {/* PL: Ten sam pasek co ScreenHeader, ale „Wstecz” jest przyciskiem, bo cofa o krok, a nie zmienia adresu. EN: The same bar as ScreenHeader, but "Wstecz" is a button, because it goes one step back and does not change the address. */}
          <button type="button" className="ui-screen-header-back editor-top__back" onClick={onBack}>
            <span aria-hidden="true">‹</span> {TEXTS.stepBack}
          </button>
          <h1 className="ui-screen-header-bar-title">{SCREEN.title}</h1>
          <span className="ui-screen-header-action" />
        </header>
      )}
      {/* PL: Pasek postępu: odcinki do bieżącego kroku są wypełnione. EN: The progress bar: the segments up to the current step are filled. */}
      <div className="editor-progress" role="progressbar" aria-label={TEXTS.stepOf(step)} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
        {STEPS.map((number) => (
          <span key={number} className={number <= step ? 'editor-progress__bar editor-progress__bar--on' : 'editor-progress__bar'} />
        ))}
      </div>
      <p className="editor-top__step">{step}/3</p>
    </div>
  );
}
