/**
 * PL: Typy danych podtoru 3a po stronie telefonu: wpis na liście, wpis pojedynczy i typy wpisów z ich nazwami. Kształt odpowiada odpowiedziom serwera z worker/news/feed/routes.ts. Typy są tu zapisane ręcznie, bo aplikacja w telefonie nie importuje kodu serwera.
 * EN: Data types of subtrack 3a on the phone side: a list entry, a single entry and the entry types with their names. The shape matches the server answers from worker/news/feed/routes.ts. The types are written by hand here, because the phone app does not import server code.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/api.ts::NewsEntryDetail
 * @used_by src/features/news/feed/filter.ts::NEWS_TYPE_LABELS
 */

/**
 * PL: Typy wpisu: ważne, news, wydarzenie, sport.
 * EN: Entry types: important, news, event, sport.
 */
export type NewsType = 'important' | 'news' | 'event' | 'sport';

/**
 * PL: Nazwy typów, jakie widzi uczeń (docs/projekt/EKRANY.md, ekran 2.2).
 * EN: The type names the student sees (docs/projekt/EKRANY.md, screen 2.2).
 */
export const NEWS_TYPE_LABELS: Record<NewsType, string> = {
  important: 'Ważne',
  news: 'News',
  event: 'Wydarzenie',
  sport: 'Sport',
};

/**
 * PL: Typy w kolejności chipów filtra.
 * EN: The types in the order of the filter chips.
 */
export const NEWS_TYPES = Object.keys(NEWS_TYPE_LABELS) as NewsType[];

/**
 * PL: Wpis na liście.
 * EN: An entry on the list.
 */
export type NewsEntrySummary = {
  /** PL: Numer wpisu. EN: The entry id. */
  id: string;
  /** PL: Typ wpisu. EN: The entry type. */
  type: NewsType;
  /** PL: Kto wydaje wpis. EN: Who issues the entry. */
  source: string;
  /** PL: Chwila publikacji jako tekst ISO 8601. EN: The publication moment as an ISO 8601 string. */
  publishedAt: string;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Krótki opis z początku treści. EN: A short description from the start of the content. */
  excerpt: string;
};

/**
 * PL: Pojedynczy wpis z treścią i linkiem.
 * EN: A single entry with the content and the link.
 */
export type NewsEntryDetail = NewsEntrySummary & {
  /** PL: Treść jako dokument JSON. EN: The content as a JSON document. */
  body: unknown;
  /** PL: Adres linku pod wpisem albo null. EN: The address of the link under the entry, or null. */
  linkUrl: string | null;
  /** PL: Napis na przycisku z linkiem albo null. EN: The label on the link button, or null. */
  linkLabel: string | null;
};
