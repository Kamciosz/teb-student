/**
 * PL: Pole szukania nad listą wpisów: pole tekstowe i przycisk „Wyczyść” widoczny, gdy coś jest wpisane. Długość tekstu jest ograniczona tak samo jak na serwerze (100 znaków).
 * EN: The search field above the entry list: a text field and a "Wyczyść" button shown when something is typed. The text length is limited the same way as on the server (100 characters).
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/news/feed/FeedListScreen.tsx::SearchField
 */

// PL: Najdłuższy szukany tekst, taki sam jak limit serwera (worker/news/feed/queries.ts::SEARCH_MAX_LENGTH).
// EN: The longest searched text, the same as the server limit (worker/news/feed/queries.ts::SEARCH_MAX_LENGTH).
const SEARCH_MAX_LENGTH = 100;

/**
 * PL: Dane pola szukania.
 * EN: The search field data.
 */
export type SearchFieldProps = {
  /** PL: Wpisany tekst. EN: The typed text. */
  value: string;
  /** PL: Wywoływane przy każdej zmianie tekstu. EN: Called on every change of the text. */
  onChange: (next: string) => void;
};

/**
 * PL: Rysuje pole szukania z przyciskiem czyszczenia.
 * EN: Draws the search field with the clear button.
 *
 * @param props - PL: wpisany tekst i funkcja zmiany. EN: the typed text and the change function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <div className="news-search">
      <input
        type="search"
        className="news-search__input"
        aria-label="Szukaj wpisów"
        placeholder="Szukaj wpisów"
        maxLength={SEARCH_MAX_LENGTH}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value !== '' ? (
        <button type="button" className="news-search__clear" aria-label="Wyczyść szukanie" onClick={() => onChange('')}>
          Wyczyść
        </button>
      ) : null}
    </div>
  );
}
