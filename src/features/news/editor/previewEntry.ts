/**
 * PL: Zamienia wpis z edytora na dane kafla, który uczeń widzi na liście (EntryCard z podtoru 3a). Opis wycina tak samo jak serwer w worker/news/feed/excerpt.ts, bo aplikacja w telefonie nie importuje kodu serwera. Gdy zmienisz tam regułę, zmień ją też tutaj.
 * EN: Turns the entry from the editor into the data of the tile the student sees on the list (EntryCard from subtrack 3a). It cuts the description the same way as the server in worker/news/feed/excerpt.ts, because the phone app does not import server code. When you change the rule there, change it here too.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/feed/types.ts::NewsEntrySummary
 * @used_by src/features/news/editor/PreviewStep.tsx::previewEntry
 */

import type { JSONContent } from '@tiptap/core';
import type { NewsEntrySummary, NewsType } from '../feed/types';

// PL: Źródło wpisu z ekranu 5.3 („Samorząd · teraz”).
// EN: The entry source from screen 5.3 ("Samorząd · teraz").
const PREVIEW_SOURCE = 'Samorząd';

// PL: Identyfikator podglądu. Nie ma wpisu na serwerze, a kliknięcie kafla w podglądzie jest zablokowane.
// EN: The preview id. There is no entry on the server, and clicking the tile in the preview is blocked.
const PREVIEW_ID = 'podglad';

// PL: Najwięcej znaków opisu na liście (tak jak EXCERPT_MAX_LENGTH na serwerze).
// EN: The most characters of the description on the list (as EXCERPT_MAX_LENGTH on the server).
const EXCERPT_MAX_LENGTH = 140;

// PL: Najgłębsze zagnieżdżenie, do którego schodzimy w treści (jak na serwerze).
// EN: The deepest nesting we descend into in the content (as on the server).
const MAX_DEPTH = 8;

/**
 * PL: Zbiera tekst z jednego węzła i jego dzieci.
 * EN: Collects the text of one node and its children.
 *
 * @param node - PL: węzeł dokumentu. EN: a document node.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: sklejony tekst węzła. EN: the joined text of the node.
 */
function textOf(node: unknown, depth: number): string {
  if (typeof node !== 'object' || node === null || depth > MAX_DEPTH) return '';
  const { text, content } = node as { text?: unknown; content?: unknown };
  if (typeof text === 'string') return text;
  return Array.isArray(content) ? content.map((child) => textOf(child, depth + 1)).join('') : '';
}

/**
 * PL: Skraca tekst do limitu na granicy słowa.
 * EN: Shortens a text to the limit at a word boundary.
 *
 * @param text - PL: tekst z pojedynczymi spacjami. EN: a text with single spaces.
 * @returns PL: tekst do limitu, z wielokropkiem, gdy go ucięto. EN: the text up to the limit, with an ellipsis when it was cut.
 */
function truncate(text: string): string {
  if (text.length <= EXCERPT_MAX_LENGTH) return text;
  const cut = text.slice(0, EXCERPT_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * PL: Opis wpisu: tekst pierwszego bloku, który ma jakiś tekst. Pusty, gdy treść ma tylko film.
 * EN: The entry description: the text of the first block that has any text. Empty when the content has only a video.
 *
 * @param body - PL: treść z edytora. EN: the content from the editor.
 * @returns PL: krótki tekst albo pusty napis. EN: a short text or an empty string.
 */
export function previewExcerpt(body: JSONContent): string {
  const blocks = Array.isArray(body.content) ? body.content : [];
  for (const block of blocks) {
    const text = textOf(block, 0).replace(/\s+/g, ' ').trim();
    if (text) return truncate(text);
  }
  return '';
}

/**
 * PL: Dane kafla podglądu dla wpisu z edytora.
 * EN: The preview tile data for an entry from the editor.
 *
 * @param type - PL: typ wpisu. EN: the entry type.
 * @param title - PL: tytuł. EN: the title.
 * @param body - PL: treść. EN: the content.
 * @param publishedAt - PL: chwila jako tekst ISO 8601 (podgląd pokazuje ją jak „przed chwilą”). EN: the moment as an ISO 8601 string (the preview shows it as "przed chwilą").
 * @returns PL: wpis w kształcie listy. EN: the entry in the list shape.
 */
export function previewEntry(type: NewsType, title: string, body: JSONContent, publishedAt: string): NewsEntrySummary {
  return { id: PREVIEW_ID, type, source: PREVIEW_SOURCE, publishedAt, title, excerpt: previewExcerpt(body) };
}
