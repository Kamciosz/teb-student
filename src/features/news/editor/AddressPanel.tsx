/**
 * PL: Okienko pod paskiem narzędzi, w którym redaktor wpisuje adres (link, film, karta linku) albo adresy źródeł. Sprawdza adres tym samym kodem co serwer (urls.ts) i pokazuje błąd po polsku, zamiast wstawić zły adres do treści.
 * EN: The panel under the toolbar where the editor types an address (a link, a video, a link card) or the source addresses. It checks the address with the same code as the server (urls.ts) and shows an error in Polish instead of inserting a bad address into the content.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/urls.ts::normalizeHttpsUrl
 * @uses src/features/news/editor/texts.ts::TEXTS
 * @used_by src/features/news/editor/EditorToolbar.tsx::AddressPanel
 */

import { useState, type FormEvent } from 'react';
import { MAX_SOURCES } from './document/limits';
import { normalizeHttpsUrl, parseYouTubeId, socialNetworkName } from './document/urls';
import { TEXTS } from './texts';

/**
 * PL: Rodzaj okienka: co wstawia wpisany adres.
 * EN: The panel kind: what the typed address inserts.
 */
export type AddressKind = 'link' | 'video' | 'card' | 'sources';

/**
 * PL: Dane okienka.
 * EN: Panel data.
 */
export type AddressPanelProps = {
  /** PL: Rodzaj okienka. EN: The panel kind. */
  kind: AddressKind;
  /** PL: Adres, który jest już w zaznaczonym linku (pusty, gdy nowy). EN: The address already in the selected link (empty when new). */
  initial: string;
  /** PL: Wywoływane z poprawną wartością: adres, identyfikator filmu albo lista źródeł. EN: Called with a valid value: an address, a video id or a list of sources. */
  onSubmit: (value: string | string[]) => void;
  /** PL: Wywoływane po „Anuluj”. EN: Called after "Anuluj" (cancel). */
  onCancel: () => void;
  /** PL: Wywoływane po „Usuń link” (tylko dla linku, który już jest). EN: Called after "Usuń link" (only for a link that already exists). */
  onRemove?: () => void;
};

/**
 * PL: Zamienia wpisany tekst na wartość do wstawienia albo null, gdy tekst jest zły.
 * EN: Turns the typed text into a value to insert, or null when the text is bad.
 *
 * @param kind - PL: rodzaj okienka. EN: the panel kind.
 * @param text - PL: wpisany tekst. EN: the typed text.
 * @returns PL: wartość albo null. EN: the value or null.
 */
function parseValue(kind: AddressKind, text: string): string | string[] | null {
  if (kind === 'link') return normalizeHttpsUrl(text);
  if (kind === 'video') return parseYouTubeId(text);
  if (kind === 'card') return socialNetworkName(text) === null ? null : normalizeHttpsUrl(text);
  // PL: Źródła: jeden adres w wierszu, puste wiersze pomijamy, każdy musi być https.
  // EN: Sources: one address per line, empty lines are skipped, each must be https.
  const urls = text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => normalizeHttpsUrl(line));
  return urls.length > 0 && urls.length <= MAX_SOURCES && urls.every((url) => url !== null) ? (urls as string[]) : null;
}

/**
 * PL: Rysuje okienko z polem na adres i przyciskami.
 * EN: Draws the panel with the address field and the buttons.
 *
 * @param props - PL: dane okienka. EN: the panel data.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function AddressPanel({ kind, initial, onSubmit, onCancel, onRemove }: AddressPanelProps) {
  // PL: Wpisany tekst i komunikat o błędzie.
  // EN: The typed text and the error message.
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const copy = TEXTS.prompt[kind];

  // PL: Po „Zapisz” sprawdź adres. Dobry wstaw, zły zgłoś.
  // EN: After "Zapisz" (save) check the address. Insert a good one, report a bad one.
  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const value = parseValue(kind, text);
    if (value === null) setError(TEXTS.prompt.errors[kind]);
    else onSubmit(value);
  }

  return (
    <form className="editor-panel" onSubmit={handleSubmit}>
      {/* PL: Pole na adres. Źródła to pole wielowierszowe. EN: The address field. Sources use a multi-line field. */}
      <label className="editor-label">
        {copy.label}
        {kind === 'sources' ? (
          <textarea className="editor-input" rows={3} value={text} onChange={(event) => setText(event.target.value)} autoFocus />
        ) : (
          <input className="editor-input" type="url" inputMode="url" value={text} onChange={(event) => setText(event.target.value)} autoFocus />
        )}
      </label>
      {/* PL: Błąd po polsku, czytany przez czytnik ekranu. EN: The error in Polish, read by a screen reader. */}
      {error ? <p role="alert" className="editor-error">{error}</p> : null}
      <div className="editor-row">
        <button type="submit" className="editor-button">{copy.submit}</button>
        {/* PL: Usuń istniejący link. EN: Remove an existing link. */}
        {onRemove ? <button type="button" className="editor-button editor-button--outline" onClick={onRemove}>{TEXTS.prompt.link.remove}</button> : null}
        <button type="button" className="editor-button editor-button--outline" onClick={onCancel}>{TEXTS.prompt.cancel}</button>
      </div>
    </form>
  );
}
