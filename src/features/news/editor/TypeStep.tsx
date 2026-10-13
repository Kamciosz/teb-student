/**
 * PL: Krok 1 kreatora (ekran 5.1): wybór typu wpisu (Ważne, News, Wydarzenie, Sport) i kafelek „dodaj” w sekcji „Zdjęcia i wideo”. Wysyłka zdjęć i filmów czeka na podtor 2, więc kafelek nic nie robi: nie otwiera wyboru plików i niczego nie wysyła. Film z YouTube dodaje się w kroku 2, w treści.
 * EN: Wizard step 1 (screen 5.1): choosing the entry type (Ważne, News, Wydarzenie, Sport) and the "add" tile in the "Zdjęcia i wideo" section. Sending photos and videos waits for the photo upload (subtrack 2), so the tile does nothing: it does not open the file picker and sends nothing. A YouTube video is added in step 2, in the content.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/texts.ts::SCREEN
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @uses src/features/news/editor/icons.tsx::PlusIcon
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::TypeStep
 */

import { PlusIcon } from './icons';
import { SCREEN, TO_AGREE } from './texts';

/**
 * PL: Typ wpisu: jedna z czterech wartości, które zna serwer (worker/db/schema/news.ts).
 * EN: The entry type: one of the four values the server knows (worker/db/schema/news.ts).
 */
export type EntryType = keyof typeof SCREEN.types;

// PL: Typy w kolejności chipów z ekranu 5.1.
// EN: The types in the chip order of screen 5.1.
const TYPES = Object.keys(SCREEN.types) as EntryType[];

/**
 * PL: Dane kroku.
 * EN: Step data.
 */
export type TypeStepProps = {
  /** PL: Wybrany typ. EN: The chosen type. */
  type: EntryType;
  /** PL: Zmiana typu. EN: Changing the type. */
  onType: (type: EntryType) => void;
  /** PL: Przejście do kroku 2. EN: Moving to step 2. */
  onNext: () => void;
};

/**
 * PL: Rysuje krok 1.
 * EN: Draws step 1.
 *
 * @param props - PL: typ i funkcje zmiany. EN: the type and the change functions.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function TypeStep({ type, onType, onNext }: TypeStepProps) {
  return (
    <section className="editor-step" aria-labelledby="editor-step-heading">
      <h1 id="editor-step-heading">{SCREEN.typeHeading}</h1>
      {/* PL: Chipy typu. Wciśnięty chip to wybrany typ. EN: The type chips. The pressed chip is the chosen type. */}
      <div className="editor-chips">
        {TYPES.map((item) => (
          <button key={item} type="button" className="editor-chip" aria-pressed={item === type} onClick={() => onType(item)}>
            {SCREEN.types[item]}
          </button>
        ))}
      </div>
      <p className="editor-label">{SCREEN.mediaLabel}</p>
      {/* PL: Kafelek „dodaj” bez obsługi kliknięcia: aria-disabled mówi czytnikowi, że nic się nie zrobi. Nie używamy disabled, bo wtedy kafelek wyglądałby na wygaszony. EN: The "add" tile has no click handler: aria-disabled tells the screen reader that nothing happens. We do not use disabled, because the tile would look greyed out. */}
      <div className="editor-media">
        <button type="button" className="editor-media__add" aria-disabled="true" aria-label={TO_AGREE.addMedia}>
          <PlusIcon />
        </button>
      </div>
      <p className="editor-note">{SCREEN.mediaHint}</p>
      <button type="button" className="editor-button editor-button--wide" onClick={onNext}>{SCREEN.next}</button>
    </section>
  );
}
