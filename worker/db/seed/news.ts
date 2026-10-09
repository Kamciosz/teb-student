/**
 * PL: Dane testowe modułu news: wymyślone wpisy do lokalnej bazy (osiem opublikowanych o różnych typach i dwa szkice). Czasy publikacji liczymy od chwili wgrania, żeby lista pokazywała „20 min temu”, a nie datę sprzed miesiąca. Teksty i przykłady pochodzą z docs/projekt/EKRANY.md, reszta jest wymyślona.
 * EN: The test data of the news module: invented entries for the local database (eight published ones of different types and two drafts). We count publication times from the moment of loading, so the list shows "20 min temu" and not a date from a month ago. The texts and examples come from docs/projekt/EKRANY.md, the rest is invented.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/news.ts::NewNewsEntryRow
 * @used_by worker/db/seed/index.ts::*
 */

// PL: Typ wiersza do wstawienia do tabeli wpisów.
// EN: The type of a row to insert into the entries table.
import type { NewNewsEntryRow } from '../schema';

// PL: Milisekundy w minucie, godzinie i dobie, do liczenia, ile temu opublikowano wpis.
// EN: Milliseconds in a minute, an hour and a day, for counting how long ago an entry was published.
const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * PL: Opis opublikowanego wpisu testowego: pola wiersza bez stanu i chwili publikacji oraz to, ile milisekund temu wpis opublikowano.
 * EN: The description of a published test entry: the row fields without the status and the publication moment, plus how many milliseconds ago the entry was published.
 */
type PublishedSpec = Omit<NewNewsEntryRow, 'status' | 'publishedAt'> & { agoMs: number };

/**
 * PL: Buduje dokument Tiptap z samych akapitów, bo tyle potrzebują prawie wszystkie wpisy testowe.
 * EN: Builds a Tiptap document made only of paragraphs, which is all that almost every test entry needs.
 *
 * @param paragraphs - PL: teksty kolejnych akapitów. EN: the texts of the consecutive paragraphs.
 * @returns PL: dokument JSON gotowy do zapisu w kolumnie body. EN: a JSON document ready to store in the body column.
 */
function paragraphsDoc(paragraphs: string[]): object {
  // PL: Każdy tekst staje się akapitem z jednym węzłem tekstowym.
  // EN: Every text becomes a paragraph with one text node.
  return {
    type: 'doc',
    content: paragraphs.map((text) => ({ type: 'paragraph', content: [{ type: 'text', text }] })),
  };
}

/**
 * PL: Dłuższa treść z nagłówkiem, listą, pogrubieniem i linkiem w tekście, żeby lista testowa pokazała elementy treści.
 * EN: A longer content with a heading, a list, bold text and a link in the text, so the test list shows the content elements.
 */
const NEWSLETTER_BODY = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Kogo szukamy' }] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Do redakcji gazetki szkolnej zapraszamy ' },
        { type: 'text', text: 'wszystkich, którzy lubią pisać', marks: [{ type: 'bold' }] },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'autorów artykułów' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'fotografów' }] }] },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Zgłoszenia: ' },
        { type: 'text', text: 'strona kółka', marks: [{ type: 'link', attrs: { href: 'https://example.com/gazetka' } }] },
        { type: 'text', text: '.' },
      ],
    },
  ],
};

/**
 * PL: Opublikowane wpisy testowe od najnowszego. Zostały w tej kolejności, bo lista ucznia też sortuje od najnowszego.
 * EN: The published test entries, newest first. They stay in this order, because the student list also sorts newest first.
 */
const PUBLISHED_SPECS: PublishedSpec[] = [
  // PL: Ważny wpis z przykładu na pulpicie i na liście aktualności.
  // EN: The important entry from the dashboard and news list examples.
  { id: 'seed-wazne-3ta', type: 'important', title: 'Jutro 3TA zaczyna o 9:50', body: paragraphsDoc(['Dwie pierwsze lekcje przeniesione na piątek.']), source: 'Sekretariat', agoMs: 20 * MINUTE_MS },
  // PL: Wymyślony wpis sportowy, bo w przykładach nie ma typu „Sport”.
  // EN: An invented sports entry, because the examples have no "Sport" type.
  { id: 'seed-koszykowka', type: 'sport', title: 'Mecz koszykówki klas drugich', body: paragraphsDoc(['Mecz w środę o 14:30 w hali.', 'Kibice wchodzą bez biletu.']), source: 'Samorząd', agoMs: 3 * HOUR_MS },
  // PL: Wydarzenie z linkiem, jak na ekranie szczegółów (2.3).
  // EN: An event with a link, as on the details screen (2.3).
  { id: 'seed-turniej', type: 'event', title: 'Turniej e-sportowy klas', body: paragraphsDoc(['Zapisy drużyn trwają do piątku 16.10. W drużynie jest pięć osób z jednej klasy. Mecze gramy w sali 204 po lekcjach.']), source: 'Samorząd', linkUrl: 'https://example.com/regulamin-turnieju', linkLabel: 'Zobacz regulamin turnieju', agoMs: 2 * DAY_MS },
  // PL: Starszy ważny wpis, żeby filtr „Ważne” miał więcej niż jeden wynik.
  // EN: An older important entry, so the "Ważne" filter has more than one result.
  { id: 'seed-wazne-ewakuacja', type: 'important', title: 'Próbna ewakuacja w czwartek', body: paragraphsDoc(['Alarm zabrzmi w czwartek około 10:00. Słuchajcie poleceń nauczycieli.']), source: 'Sekretariat', agoMs: 4 * DAY_MS },
  // PL: Zwykła nowość z przykładu na liście.
  // EN: A plain news item from the list example.
  { id: 'seed-biblioteka', type: 'news', title: 'Nowe godziny otwarcia biblioteki', body: paragraphsDoc(['Od poniedziałku czynna do 17:00.']), source: 'Biblioteka', agoMs: 5 * DAY_MS },
  // PL: Wpis o egzaminie z przykładu na pulpicie.
  // EN: The exam entry from the dashboard example.
  { id: 'seed-egzamin', type: 'news', title: 'Próbny egzamin zawodowy INF.04', body: paragraphsDoc(['Egzamin odbędzie się 22.10.']), source: 'Sekretariat', agoMs: 8 * DAY_MS },
  // PL: Dzień otwarty z przykładu na pulpicie.
  // EN: The open day from the dashboard example.
  { id: 'seed-dzien-otwarty', type: 'event', title: 'Dzień otwarty: szukamy 20 osób', body: paragraphsDoc(['Dzień otwarty szkoły odbędzie się 14.11.']), source: 'Samorząd', agoMs: 10 * DAY_MS },
  // PL: Wpis z nagłówkiem, listą i linkiem w treści.
  // EN: An entry with a heading, a list and a link in the content.
  { id: 'seed-gazetka', type: 'news', title: 'Gazetka szkolna szuka autorów', body: NEWSLETTER_BODY, source: 'Gazetka', agoMs: 20 * DAY_MS },
];

/**
 * PL: Szkice: uczeń nie może ich zobaczyć. Test i e2e sprawdzają, że nie ma ich ani na liście, ani pod własnym adresem.
 * EN: Drafts: a student must not see them. The test and e2e check that they are neither on the list nor at their own address.
 */
const DRAFT_ROWS: NewNewsEntryRow[] = [
  { id: 'seed-szkic-wycieczka', type: 'news', status: 'draft', title: 'Szkic: wycieczka klas pierwszych', body: paragraphsDoc(['Termin jeszcze niepotwierdzony.']), source: 'Samorząd', publishedAt: null },
  { id: 'seed-szkic-sport', type: 'sport', status: 'draft', title: 'Szkic: dzień sportu', body: paragraphsDoc(['Plan w przygotowaniu.']), source: 'Samorząd', publishedAt: null },
];

/**
 * PL: Buduje wpisy testowe licząc czas publikacji od podanej chwili.
 * EN: Builds the test entries counting the publication time from the given moment.
 *
 * @param now - PL: chwila wgrania danych, domyślnie teraz. EN: the moment the data is loaded, now by default.
 * @returns PL: wiersze do wstawienia do tabeli news_entries. EN: rows to insert into the news_entries table.
 */
export function buildNewsSeed(now: Date = new Date()): NewNewsEntryRow[] {
  // PL: Zamień opisy na wiersze: dodaj stan „published” i chwilę publikacji liczoną wstecz od „teraz”.
  // EN: Turn the descriptions into rows: add the "published" status and the publication moment counted back from "now".
  const published = PUBLISHED_SPECS.map(({ agoMs, ...row }): NewNewsEntryRow => ({
    ...row,
    status: 'published',
    publishedAt: new Date(now.getTime() - agoMs),
  }));

  // PL: Dołącz szkice na końcu.
  // EN: Append the drafts at the end.
  return [...published, ...DRAFT_ROWS];
}
