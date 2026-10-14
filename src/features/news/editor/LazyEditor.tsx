/**
 * PL: Leniwe ładowanie edytora. Tiptap waży około 130 KB po gzip (ADR 0002), więc nie wchodzi do głównej paczki: pobiera się dopiero, gdy redaktor otworzy krok z treścią. Gdy pobranie się nie uda (brak internetu, brak zapisu w telefonie), zamiast białego ekranu pojawia się komunikat z przyciskiem „Wczytaj ponownie”. Podgląd (krok 3) nie potrzebuje Tiptapa, bo używa RichContent z podtoru 3a.
 * EN: Lazy loading of the editor. Tiptap weighs about 130 KB gzipped (ADR 0002), so it stays out of the main bundle: it downloads only when the editor opens the content step. When the download fails (no internet, nothing saved in the phone), a message with the "Wczytaj ponownie" button appears instead of a white screen. The preview (step 3) does not need Tiptap, because it uses RichContent from subtrack 3a.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/RichEditor.tsx::RichEditor
 * @used_by src/features/news/editor/ContentStep.tsx::LazyEditor
 */

import { useEffect, useState, type ComponentType } from 'react';
import type { RichEditorProps } from './RichEditor';
import { TEXTS } from './texts';

/**
 * PL: Ładuje moduł z komponentem i pokazuje go, gdy jest gotowy.
 * EN: Loads a module with a component and shows it when ready.
 *
 * @param load - PL: funkcja, która pobiera moduł (import dynamiczny). EN: a function that downloads the module (a dynamic import).
 * @param props - PL: dane dla komponentu. EN: the data for the component.
 * @returns PL: komponent, napis o ładowaniu albo komunikat o błędzie. EN: the component, a loading label or an error message.
 */
function LazyComponent<Props extends object>({ load, props }: { load: () => Promise<{ default: ComponentType<Props> }>; props: Props }) {
  // PL: Pobrany komponent i znacznik, że pobranie się nie udało.
  // EN: The downloaded component and the mark that the download failed.
  const [component, setComponent] = useState<{ Component: ComponentType<Props> } | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  // PL: Pobierz moduł raz po pokazaniu kroku.
  // EN: Download the module once after the step is shown.
  useEffect(() => {
    load().then((module) => setComponent({ Component: module.default }), () => setHasFailed(true));
  }, [load]);

  if (component) return <component.Component {...props} />;
  if (!hasFailed) return <p role="status" className="editor-note">{TEXTS.loading}</p>;
  // PL: Nieudane pobranie modułu przeglądarka zapamiętuje do przeładowania strony, więc przycisk przeładowuje stronę.
  // EN: The browser remembers a failed module download until the page reloads, so the button reloads the page.
  return (
    <div className="editor-note" role="alert">
      <p>{TEXTS.loadFailed}</p>
      <button type="button" className="editor-button" onClick={() => window.location.reload()}>{TEXTS.reload}</button>
    </div>
  );
}

// PL: Funkcja pobierająca moduł. Stała, żeby efekt nie startował od nowa przy każdym renderze.
// EN: The function that downloads the module. A constant, so the effect does not restart on every render.
const loadEditor = () => import('./RichEditor');

/**
 * PL: Edytor ładowany leniwie.
 * EN: The lazily loaded editor.
 *
 * @param props - PL: dane edytora (RichEditor). EN: the editor data (RichEditor).
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function LazyEditor(props: RichEditorProps) {
  return <LazyComponent load={loadEditor} props={props} />;
}
