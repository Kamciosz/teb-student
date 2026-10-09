/**
 * PL: Schemat bazy modułu news (tabele Drizzle): wpisy aktualności. Tabelę czytają podtory 3a (lista i wpis ucznia), 3b (edytor) i 3c (panel), ale schemat należy do 3a, bo to pierwszy podtor modułu (docs/PODZIAL_PRACY.md, część 2). Tabela nie ma kolumny z numerem ucznia: wpis niesie tylko napis źródła („Samorząd”), więc przy usunięciu konta nie ma czego kasować.
 * EN: The database schema of the news module (Drizzle tables): news entries. Subtracks 3a (student list and entry), 3b (editor) and 3c (panel) read the table, but the schema belongs to 3a, because it is the module's first subtrack (docs/PODZIAL_PRACY.md, part 2). The table has no student id column: an entry carries only a source label ("Samorząd"), so there is nothing to delete when an account is removed.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/db/schema/index.ts::*
 * @used_by worker/db/seed/news.ts::newsEntries
 * @used_by worker/news/feed/queries.ts::newsEntries
 */

// PL: Funkcje Drizzle do opisu tabeli SQLite (D1 to SQLite).
// EN: Drizzle functions that describe a SQLite table (D1 is SQLite).
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/**
 * PL: Cztery typy wpisu z planu (docs/PLAN_APLIKACJI.md, część 2, punkt 3). Wartości są po angielsku, napisy dla ucznia („Ważne”, „News”, „Wydarzenie”, „Sport”) dopisuje telefon.
 * EN: The four entry types from the plan (docs/PLAN_APLIKACJI.md, part 2, point 3). Values are in English, the labels for the student ("Ważne", "News", "Wydarzenie", "Sport") are added by the phone.
 */
export const NEWS_ENTRY_TYPES = ['important', 'news', 'event', 'sport'] as const;

/**
 * PL: Typ wpisu: jedna z wartości NEWS_ENTRY_TYPES.
 * EN: The entry type: one of the NEWS_ENTRY_TYPES values.
 */
export type NewsEntryType = (typeof NEWS_ENTRY_TYPES)[number];

/**
 * PL: Stan wpisu: szkic widzi tylko Samorząd w panelu, opublikowany widzą wszyscy uczniowie.
 * EN: The entry state: only the Student Council sees a draft in the panel, every student sees a published entry.
 */
export const NEWS_ENTRY_STATUSES = ['draft', 'published'] as const;

/**
 * PL: Stan wpisu: jedna z wartości NEWS_ENTRY_STATUSES.
 * EN: The entry status: one of the NEWS_ENTRY_STATUSES values.
 */
export type NewsEntryStatus = (typeof NEWS_ENTRY_STATUSES)[number];

/**
 * PL: Wpisy aktualności. Treść jest dokumentem JSON w formacie Tiptap/ProseMirror (docs/adr/0002-edytor-wpisow.md), a nie HTML.
 * EN: News entries. The content is a JSON document in the Tiptap/ProseMirror format (docs/adr/0002-edytor-wpisow.md), not HTML.
 */
export const newsEntries = sqliteTable(
  'news_entries',
  {
    /** PL: Numer wpisu (tekst losowy), tworzy go serwer przy zapisie wpisu. EN: The entry id (a random string), created by the server when it saves the entry. */
    id: text('id').primaryKey(),
    /** PL: Typ wpisu, od którego zależy filtr na liście. EN: The entry type the list filter depends on. */
    type: text('type', { enum: NEWS_ENTRY_TYPES }).notNull(),
    /** PL: Stan wpisu. Lista ucznia pokazuje tylko „published”. EN: The entry status. The student list shows only "published". */
    status: text('status', { enum: NEWS_ENTRY_STATUSES }).notNull().default('draft'),
    /** PL: Tytuł wpisu. EN: The entry title. */
    title: text('title').notNull(),
    /** PL: Treść: dokument JSON Tiptap (węzły i znaczniki). EN: The content: a Tiptap JSON document (nodes and marks). */
    body: text('body', { mode: 'json' }).notNull(),
    /** PL: Kto wydaje wpis, na przykład „Samorząd” albo „Sekretariat”. To napis, nie konto. EN: Who issues the entry, for example "Samorząd" or "Sekretariat". A label, not an account. */
    source: text('source').notNull(),
    /** PL: Chwila publikacji w milisekundach od 1970 roku. Pusta dla szkicu. EN: The publication moment in milliseconds since 1970. Empty for a draft. */
    publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
    /** PL: Adres https, który otwiera przycisk pod wpisem. Pusty, gdy wpis nie ma linku. EN: The https address the button under the entry opens. Empty when the entry has no link. */
    linkUrl: text('link_url'),
    /** PL: Napis na przycisku z linkiem, na przykład „Zobacz regulamin turnieju”. EN: The label on the link button, for example "Zobacz regulamin turnieju". */
    linkLabel: text('link_label'),
  },
  // PL: Indeks pod zapytanie listy: wpisy w danym stanie od najnowszego.
  // EN: The index for the list query: entries in a given status, newest first.
  (table) => [index('news_entries_status_published_at_idx').on(table.status, table.publishedAt)],
);

/**
 * PL: Wiersz tabeli wpisów, tak jak wraca z bazy.
 * EN: A row of the entries table, as it comes back from the database.
 */
export type NewsEntryRow = typeof newsEntries.$inferSelect;

/**
 * PL: Wiersz tabeli wpisów do wstawienia (pola z wartością domyślną są opcjonalne).
 * EN: A row of the entries table to insert (fields with a default are optional).
 */
export type NewNewsEntryRow = typeof newsEntries.$inferInsert;
