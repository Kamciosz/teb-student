/**
 * PL: Trzy kroki formularza zgłoszenia: czego dotyczy (ekran 3.1), gdzie to jest (3.2) i opis z anonimowością (3.3). Każdy krok pokazuje dane z szkicu i zgłasza zmianę wyżej; o przejściu między krokami decyduje ReportForm.
 * EN: The three steps of the report form: what it is about (screen 3.1), where it is (3.2) and the description with anonymity (3.3). Every step shows the draft data and reports a change upward; ReportForm decides on moving between steps.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportOptions.ts::CATEGORY_OPTIONS
 * @uses src/features/reports/student/icons.tsx::Icon
 * @used_by src/features/reports/student/ReportForm.tsx::StepCategory
 * @used_by src/features/reports/student/ReportForm.tsx::StepPlace
 * @used_by src/features/reports/student/ReportForm.tsx::StepDescription
 */

// PL: Ikony kart.
// EN: The card icons.
import { Icon } from './icons';
// PL: Listy wyborów i limity długości.
// EN: The choice lists and the length limits.
import { CATEGORY_OPTIONS, MAX_DESCRIPTION_LENGTH, MAX_PLACE_DETAIL_LENGTH, PLACE_OPTIONS } from './reportOptions';

/** PL: Szkic zgłoszenia wypełniany w trzech krokach. EN: The report draft filled in three steps. */
export type Draft = {
  category: string;
  place: string;
  placeDetail: string;
  description: string;
  isAnonymous: boolean;
};

/** PL: Dane kroku: szkic i funkcja zmiany. EN: The step data: the draft and the change function. */
export type StepProps = {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
};

/**
 * PL: Przenosi fokus na nagłówek kroku po zmianie ekranu, żeby czytnik ekranu go odczytał.
 * EN: Moves focus to the step heading after a screen change, so a screen reader reads it.
 *
 * @param element - PL: nagłówek albo `null` przy odpinaniu. EN: the heading, or `null` on detach.
 */
function focusHeading(element: HTMLElement | null): void {
  // PL: Przy odpinaniu elementu nie ma czego fokusować.
  // EN: When the element detaches there is nothing to focus.
  element?.focus();
}

/**
 * PL: Krok 1: cztery karty kategorii. Żadna nie jest wybrana na starcie, żeby uczeń zdecydował sam.
 * EN: Step 1: four category cards. None is chosen at the start, so the student decides.
 *
 * @param props - PL: szkic i funkcja zmiany. EN: the draft and the change function.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function StepCategory({ draft, onChange }: StepProps) {
  // PL: Nagłówek, opis i siatka kart.
  // EN: The heading, the lead and the card grid.
  return (
    <div>
      <h1 ref={focusHeading} tabIndex={-1}>Czego dotyczy?</h1>
      <p className="rs-lead">Wybierz jedno. W następnych krokach dodasz miejsce i opis.</p>
      <div className="rs-pick" role="radiogroup" aria-label="Czego dotyczy zgłoszenie">
        {CATEGORY_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={draft.category === option.code}
            className={draft.category === option.code ? 'rs-card rs-on' : 'rs-card'}
            onClick={() => onChange({ category: option.code })}
          >
            <Icon name={option.icon} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * PL: Krok 2: sześć chipów miejsca i pole „Dokładne miejsce”.
 * EN: Step 2: six place chips and the "Dokładne miejsce" field.
 *
 * @param props - PL: szkic i funkcja zmiany. EN: the draft and the change function.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function StepPlace({ draft, onChange }: StepProps) {
  // PL: Nagłówek, chipy miejsc i pole tekstowe.
  // EN: The heading, the place chips and the text field.
  return (
    <div>
      <h1 ref={focusHeading} tabIndex={-1}>Gdzie to jest?</h1>
      <p className="rs-lead">Zaznacz miejsce i dopisz szczegóły.</p>
      <div className="rs-chips" role="radiogroup" aria-label="Miejsce">
        {PLACE_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            role="radio"
            aria-checked={draft.place === option.code}
            className={draft.place === option.code ? 'rs-chip rs-on' : 'rs-chip'}
            onClick={() => onChange({ place: option.code })}
          >
            {option.label}
          </button>
        ))}
      </div>
      <label className="rs-field">
        <span>Dokładne miejsce</span>
        <input type="text" value={draft.placeDetail} maxLength={MAX_PLACE_DETAIL_LENGTH} placeholder="np. sala 204, 2. piętro" onChange={(event) => onChange({ placeDetail: event.target.value })} />
      </label>
    </div>
  );
}

/**
 * PL: Krok 3: pole opisu i przełącznik „Wyślij anonimowo” (domyślnie włączony).
 * EN: Step 3: the description field and the "Wyślij anonimowo" switch (on by default).
 *
 * @param props - PL: szkic i funkcja zmiany. EN: the draft and the change function.
 * @returns PL: drzewo elementów kroku. EN: the tree of step elements.
 */
export function StepDescription({ draft, onChange }: StepProps) {
  // PL: Podpowiedź o pustym opisie pokazujemy, dopóki w polu nie ma tekstu.
  // EN: We show the hint about an empty description while the field has no text.
  const isEmpty = draft.description.trim() === '';
  return (
    <div>
      <h1 ref={focusHeading} tabIndex={-1}>Opisz krótko</h1>
      <p className="rs-lead">Wystarczą jedno lub dwa zdania.</p>
      <label className="rs-field">
        <span>Opis</span>
        <textarea rows={4} value={draft.description} maxLength={MAX_DESCRIPTION_LENGTH} placeholder="Co się stało?" aria-describedby="rs-desc-hint" onChange={(event) => onChange({ description: event.target.value })} />
      </label>
      <small id="rs-desc-hint" className="rs-hint" hidden={!isEmpty}>Wpisz opis, żeby wysłać zgłoszenie.</small>
      <label className="rs-switch">
        <input type="checkbox" role="switch" checked={draft.isAnonymous} onChange={(event) => onChange({ isAnonymous: event.target.checked })} />
        <span className="rs-track" />
        <span>
          <b>Wyślij anonimowo</b>
          <small>Samorząd nie zobaczy, kto zgłosił.</small>
        </span>
      </label>
    </div>
  );
}
