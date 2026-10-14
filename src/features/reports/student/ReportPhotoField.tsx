/**
 * PL: Pole zdjęcia w kroku opisu: przycisk „Dodaj zdjęcie” (nieobowiązkowy), stan wysyłania, nazwa pliku, „Usuń zdjęcie” i błąd z ponowieniem. Pole nie trzyma stanu; dostaje go od formularza.
 * EN: The photo field on the description step: an optional "Dodaj zdjęcie" button, the sending state, the file name, "Usuń zdjęcie" and an error with retry. The field holds no state; the form gives it the state.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/reports/student/useReportPhoto.ts::ReportPhotoController
 * @used_by src/features/reports/student/ReportForm.tsx::ReportPhotoField
 */

// PL: Typ stanu i akcji zdjęcia.
// EN: The type of the photo state and actions.
import type { ReportPhotoController } from './useReportPhoto';

// PL: Komunikaty błędów przychodzą z drzwi media.
// EN: The error messages come from the media door.
const TEXTS = {
  add: 'Dodaj zdjęcie',
  remove: 'Usuń zdjęcie',
  uploading: 'Wysyłam zdjęcie…',
  retry: 'Spróbuj ponownie',
  hint: 'Zdjęcie jest nieobowiązkowe.',
  attached: 'Zdjęcie dołączone:',
} as const;

/**
 * PL: Rysuje pole zdjęcia w zależności od stanu.
 * EN: Draws the photo field depending on the state.
 *
 * @param props - PL: stan i akcje z formularza. EN: the state and the actions from the form.
 * @returns PL: drzewo elementów pola. EN: the tree of field elements.
 */
export function ReportPhotoField({ state, choose, retry, remove }: ReportPhotoController) {
  // PL: Wybór pliku pokazujemy przy braku zdjęcia i po błędzie (wtedy można wybrać inne).
  // EN: The file choice is shown with no photo and after an error (then another one can be chosen).
  const showAdd = state.status === 'idle' || state.status === 'error';
  return (
    <section className="rs-photo" aria-label="Zdjęcie do zgłoszenia">
      {showAdd ? (
        <label className="rs-photo-add">
          {/* PL: Pole pokrywa całą etykietę, więc dotknięcie i fokus działają na całym przycisku. EN: The field covers the whole label, so touch and focus work on the whole button. */}
          <input
            type="file"
            accept="image/*"
            className="rs-photo-input"
            onChange={(event) => {
              const file = event.target.files?.[0];
              // PL: Czyścimy pole, żeby ponowny wybór tego samego pliku też wywołał zmianę.
              // EN: We clear the field, so choosing the same file again also fires a change.
              event.target.value = '';
              if (file) choose(file);
            }}
          />
          <span>{TEXTS.add}</span>
        </label>
      ) : null}
      {state.status === 'idle' ? <small className="rs-hint">{TEXTS.hint}</small> : null}
      {state.status === 'uploading' ? <p className="rs-photo-status" role="status">{TEXTS.uploading}</p> : null}
      {state.status === 'ready' ? <p className="rs-photo-status">{TEXTS.attached} <b>{state.fileName}</b></p> : null}
      {state.status === 'error' ? <p className="rs-error" role="alert">{state.message}</p> : null}
      {state.status === 'error' && state.canRetry ? (
        <button type="button" className="rs-photo-btn" onClick={retry}>{TEXTS.retry}</button>
      ) : null}
      {state.status === 'ready' || state.status === 'error' ? (
        <button type="button" className="rs-photo-btn" onClick={remove}>{TEXTS.remove}</button>
      ) : null}
    </section>
  );
}
