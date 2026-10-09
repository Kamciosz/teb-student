/**
 * PL: Wycina krótki opis wpisu z jego treści (dokumentu JSON Tiptap), żeby lista aktualności nie wysyłała całych artykułów. Czyta tylko tekst, więc nieznane elementy w treści niczego nie psują.
 * EN: Cuts a short description of an entry from its content (a Tiptap JSON document), so the news list does not send whole articles. It reads only text, so unknown elements in the content break nothing.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/news/feed/routes.ts::toSummary
 * @used_by worker/news/feed/excerpt.test.ts::excerptFromBody
 */

/**
 * PL: Najwięcej znaków opisu na liście. Dłuższy tekst jest ucinany na granicy słowa i kończy się wielokropkiem.
 * EN: The most characters of the description on the list. A longer text is cut at a word boundary and ends with an ellipsis.
 */
export const EXCERPT_MAX_LENGTH = 140;

/**
 * PL: Najgłębsze zagnieżdżenie, do którego schodzimy w treści. Chroni przed zbyt głębokim dokumentem.
 * EN: The deepest nesting we descend into in the content. Protects against an overly deep document.
 */
const MAX_DEPTH = 8;

/**
 * PL: Zbiera tekst z jednego węzła i jego dzieci.
 * EN: Collects the text of one node and its children.
 *
 * @param node - PL: węzeł dokumentu o nieznanym kształcie. EN: a document node of unknown shape.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: sklejony tekst węzła. EN: the joined text of the node.
 */
function textOf(node: unknown, depth: number): string {
  // PL: Poza obiektem albo za głęboko nie ma tekstu do wzięcia.
  // EN: Outside an object or too deep there is no text to take.
  if (typeof node !== 'object' || node === null || depth > MAX_DEPTH) return '';
  const { text, content } = node as { text?: unknown; content?: unknown };

  // PL: Węzeł tekstowy oddaje swój tekst.
  // EN: A text node gives its text.
  if (typeof text === 'string') return text;

  // PL: Węzeł z dziećmi: sklej tekst dzieci.
  // EN: A node with children: join the text of the children.
  return Array.isArray(content) ? content.map((child) => textOf(child, depth + 1)).join('') : '';
}

/**
 * PL: Skraca tekst do limitu na granicy słowa.
 * EN: Shortens a text to the limit at a word boundary.
 *
 * @param text - PL: tekst z jedną spacją między słowami. EN: a text with a single space between words.
 * @returns PL: tekst do limitu, z wielokropkiem, gdy go ucięto. EN: the text up to the limit, with an ellipsis when it was cut.
 */
function truncate(text: string): string {
  // PL: Krótki tekst zostaje bez zmian.
  // EN: A short text stays unchanged.
  if (text.length <= EXCERPT_MAX_LENGTH) return text;

  // PL: Utnij do limitu, a potem cofnij się do ostatniej spacji, żeby nie przeciąć słowa.
  // EN: Cut to the limit, then step back to the last space so a word is not split.
  const cut = text.slice(0, EXCERPT_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * PL: Zwraca opis wpisu: tekst pierwszego bloku, który ma jakiś tekst.
 * EN: Returns the entry description: the text of the first block that has any text.
 *
 * @param body - PL: treść wpisu z bazy (dokument Tiptap albo coś nieoczekiwanego). EN: the entry content from the database (a Tiptap document or something unexpected).
 * @returns PL: krótki tekst, pusty gdy treść nie ma tekstu. EN: a short text, empty when the content has no text.
 */
export function excerptFromBody(body: unknown): string {
  // PL: Dokument musi być obiektem z listą bloków.
  // EN: The document must be an object with a list of blocks.
  const blocks = (body as { content?: unknown } | null)?.content;
  if (!Array.isArray(blocks)) return '';

  // PL: Weź pierwszy blok z tekstem, a białe znaki zamień na pojedyncze spacje.
  // EN: Take the first block with text and turn whitespace into single spaces.
  for (const block of blocks) {
    const text = textOf(block, 0).replace(/\s+/g, ' ').trim();
    if (text) return truncate(text);
  }

  // PL: Żaden blok nie ma tekstu, na przykład sam film.
  // EN: No block has text, for example a video alone.
  return '';
}
