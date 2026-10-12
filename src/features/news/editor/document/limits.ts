/**
 * PL: Limity wpisu: tytuł, długość tekstu, rozmiar dokumentu, głębokość i liczba źródeł. Telefon (licznik znaków) i serwer (odrzucanie za dużych wpisów) czytają te same liczby.
 * EN: Entry limits: title, text length, document size, depth and the number of sources. The phone (the character counter) and the server (rejecting too large entries) read the same numbers.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/editor/RichEditor.tsx::MAX_TEXT_CHARS
 * @used_by src/features/news/editor/ContentStep.tsx::MAX_TITLE_CHARS
 * @used_by src/features/news/editor/AddressPanel.tsx::MAX_SOURCES
 * @used_by worker/news/editor/validateBody.ts::MAX_BODY_BYTES
 * @used_by worker/news/editor/validateEntry.ts::MAX_TITLE_CHARS
 */

// PL: Najdłuższy tytuł. Tytuł jest nagłówkiem wpisu i kafla na liście, więc krótki. Wartość do ustalenia z redakcją.
// EN: The longest title. The title is the heading of the entry and of the list tile, so it is short. The value is to be agreed with the editorial team.
export const MAX_TITLE_CHARS = 120;

// PL: Najwięcej znaków tekstu w treści. Edytor służy też do artykułów gazetki, więc nie 500 jak w makiecie 5.2. Wartość do ustalenia.
// EN: The most text characters in the content. The editor also serves the newspaper articles, so not 500 as in mockup 5.2. The value is to be agreed.
export const MAX_TEXT_CHARS = 20000;

// PL: Największy rozmiar dokumentu JSON w bajtach. Chroni bazę i telefon przed ogromnym wpisem.
// EN: The largest size of the JSON document in bytes. Protects the database and the phone from a huge entry.
export const MAX_BODY_BYTES = 200_000;

// PL: Największa głębokość zagnieżdżenia (listy w listach, cytat w liście). Czytnik w podtorze 3a obcina głębiej niż 6, więc 8 zostawia zapas.
// EN: The largest nesting depth (lists in lists, a quote in a list). The reader in subtrack 3a cuts deeper than 6, so 8 leaves room.
export const MAX_DEPTH = 8;

// PL: Najwięcej linków w sekcji „Źródła”.
// EN: The most links in the "Źródła" (sources) section.
export const MAX_SOURCES = 20;

// PL: Najdłuższy podpis pod zdjęciem i opis zdjęcia dla czytnika ekranu.
// EN: The longest caption under a photo and the photo description for a screen reader.
export const MAX_CAPTION_CHARS = 300;

// PL: Największy bok zdjęcia w pikselach. Telefon zmniejsza zdjęcie do 1600 px (plan, „Zdjęcia i filmy”), więc 4000 to zapas.
// EN: The largest photo side in pixels. The phone shrinks a photo to 1600 px (plan, "Zdjęcia i filmy"), so 4000 is a margin.
export const MAX_IMAGE_SIDE = 4000;
