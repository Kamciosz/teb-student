/**
 * PL: Czyszczenie treści wpisu po stronie telefonu. Zamienia dokument JSON w stylu Tiptap na drzewo bezpiecznych bloków, w którym są tylko elementy z listy dozwolonych (ADR 0002). Nieznany element znika, link inny niż https znika (tekst zostaje), a identyfikator filmu musi mieć 11 znaków. Telefon nie ufa serwerowi: czyści treść także wtedy, gdy serwer już ją sprawdził.
 * EN: Cleaning of the entry content on the phone side. Turns a Tiptap-style JSON document into a tree of safe blocks that holds only elements from the allowed list (ADR 0002). An unknown element disappears, a link other than https disappears (the text stays), and a video id must have 11 characters. The phone does not trust the server: it cleans the content even when the server already checked it.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/content/RichContent.tsx::sanitizeDocument
 * @used_by src/features/news/feed/content/sanitize.test.tsx::sanitizeDocument
 */

/**
 * PL: Fragment tekstu w linii: tekst z pogrubieniem, kursywą, podkreśleniem i adresem linku (https) albo łamanie wiersza.
 * EN: An inline piece: text with bold, italic, underline and a link address (https), or a line break.
 */
export type SafeInline =
  | { kind: 'text'; text: string; bold: boolean; italic: boolean; underline: boolean; href: string | null }
  | { kind: 'break' };

/**
 * PL: Blok treści. Lista ma pozycje, a każda pozycja jest listą bloków (może zawierać listę zagnieżdżoną).
 * EN: A content block. A list has items, and every item is a list of blocks (it may contain a nested list).
 */
export type SafeBlock =
  | { kind: 'paragraph'; children: SafeInline[] }
  | { kind: 'heading'; level: 2 | 3; children: SafeInline[] }
  | { kind: 'list'; ordered: boolean; items: SafeBlock[][] }
  | { kind: 'quote'; children: SafeBlock[] }
  | { kind: 'youtube'; videoId: string };

// PL: Największa głębokość zagnieżdżenia bloków. Głębsza treść jest obcinana, żeby złośliwy dokument nie zawiesił telefonu.
// EN: The largest block nesting depth. Deeper content is cut off, so a malicious document cannot hang the phone.
const MAX_DEPTH = 6;

// PL: Identyfikator filmu YouTube: dokładnie 11 znaków: litery, cyfry, myślnik i podkreślenie.
// EN: A YouTube video id: exactly 11 characters: letters, digits, hyphen and underscore.
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * PL: Sprawdza, czy wartość jest zwykłym obiektem (nie null i nie tablicą).
 * EN: Checks whether a value is a plain object (not null and not an array).
 *
 * @param value - PL: dowolna wartość. EN: any value.
 * @returns PL: prawda dla obiektu. EN: true for an object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * PL: Oddaje tablicę dzieci węzła albo pustą tablicę.
 * EN: Returns the node's children array or an empty array.
 *
 * @param node - PL: węzeł dokumentu. EN: a document node.
 * @returns PL: lista dzieci. EN: the list of children.
 */
function childrenOf(node: Record<string, unknown>): unknown[] {
  return Array.isArray(node.content) ? node.content : [];
}

/**
 * PL: Zwraca adres tylko wtedy, gdy jest poprawnym adresem https bez loginu i hasła. Adres jest przepuszczany przez parser URL, więc spacje, znaki sterujące i wielkość liter w „javascript:” nie obchodzą sprawdzenia.
 * EN: Returns the address only when it is a valid https address without a user name and password. The address goes through the URL parser, so spaces, control characters and letter case in "javascript:" cannot get around the check.
 *
 * @param raw - PL: adres z treści wpisu. EN: the address from the entry content.
 * @returns PL: znormalizowany adres albo null. EN: the normalised address or null.
 */
export function safeHttpsUrl(raw: unknown): string | null {
  // PL: Adres musi być tekstem.
  // EN: The address must be a string.
  if (typeof raw !== 'string') return null;
  try {
    // PL: Parser odrzuca śmieci, a protokół i nazwa hosta mówią, czy to zwykły https.
    // EN: The parser rejects garbage, and the protocol and host name tell whether it is plain https.
    const url = new URL(raw);
    const isPlainHttps = url.protocol === 'https:' && url.hostname !== '' && url.username === '' && url.password === '';
    return isPlainHttps ? url.href : null;
  } catch {
    // PL: Tekst, który nie jest adresem.
    // EN: A text that is not an address.
    return null;
  }
}

/**
 * PL: Zwraca identyfikator filmu tylko wtedy, gdy ma poprawny kształt.
 * EN: Returns the video id only when it has the right shape.
 *
 * @param raw - PL: identyfikator z treści wpisu. EN: the id from the entry content.
 * @returns PL: identyfikator albo null. EN: the id or null.
 */
export function safeVideoId(raw: unknown): string | null {
  return typeof raw === 'string' && VIDEO_ID_PATTERN.test(raw) ? raw : null;
}

/**
 * PL: Czyta znaczniki tekstu (pogrubienie, kursywa, podkreślenie, link). Nieznane znaczniki są pomijane.
 * EN: Reads the text marks (bold, italic, underline, link). Unknown marks are skipped.
 *
 * @param marks - PL: lista znaczników z węzła tekstu. EN: the mark list from a text node.
 * @returns PL: ustawienia stylu tekstu. EN: the text style settings.
 */
function readMarks(marks: unknown): Pick<Extract<SafeInline, { kind: 'text' }>, 'bold' | 'italic' | 'underline' | 'href'> {
  const style = { bold: false, italic: false, underline: false, href: null as string | null };
  if (!Array.isArray(marks)) return style;
  for (const mark of marks) {
    if (!isRecord(mark)) continue;
    if (mark.type === 'bold') style.bold = true;
    if (mark.type === 'italic') style.italic = true;
    if (mark.type === 'underline') style.underline = true;
    // PL: Link bez poprawnego adresu https zostaje zwykłym tekstem.
    // EN: A link without a valid https address stays plain text.
    if (mark.type === 'link' && isRecord(mark.attrs)) style.href = safeHttpsUrl(mark.attrs.href);
  }
  return style;
}

/**
 * PL: Czyści jeden fragment linii: tekst albo łamanie wiersza. Inne węzły są pomijane.
 * EN: Cleans one inline piece: text or a line break. Other nodes are skipped.
 *
 * @param node - PL: węzeł dokumentu. EN: a document node.
 * @returns PL: bezpieczny fragment albo null. EN: a safe piece or null.
 */
function sanitizeInline(node: unknown): SafeInline | null {
  if (!isRecord(node)) return null;
  if (node.type === 'hardBreak') return { kind: 'break' };
  if (node.type !== 'text' || typeof node.text !== 'string' || node.text === '') return null;
  return { kind: 'text', text: node.text, ...readMarks(node.marks) };
}

/**
 * PL: Czyści wszystkie fragmenty linii w węźle.
 * EN: Cleans all inline pieces in a node.
 *
 * @param node - PL: akapit albo nagłówek. EN: a paragraph or a heading.
 * @returns PL: lista bezpiecznych fragmentów. EN: the list of safe pieces.
 */
function inlineChildren(node: Record<string, unknown>): SafeInline[] {
  return childrenOf(node).flatMap((child) => sanitizeInline(child) ?? []);
}

/**
 * PL: Czyści nagłówek. Poziom 1 i 2 dają mniejszy nagłówek „h2”, a każdy inny poziom „h3”, bo „h1” jest tytułem wpisu.
 * EN: Cleans a heading. Levels 1 and 2 give the larger "h2", and every other level gives "h3", because "h1" is the entry title.
 *
 * @param node - PL: węzeł nagłówka. EN: the heading node.
 * @returns PL: bezpieczny nagłówek. EN: a safe heading.
 */
function sanitizeHeading(node: Record<string, unknown>): SafeBlock {
  const level = isRecord(node.attrs) ? node.attrs.level : undefined;
  return { kind: 'heading', level: level === 1 || level === 2 ? 2 : 3, children: inlineChildren(node) };
}

/**
 * PL: Czyści listę: bierze tylko pozycje listy, a z każdej jej bloki.
 * EN: Cleans a list: takes only list items, and from each of them its blocks.
 *
 * @param node - PL: węzeł listy. EN: the list node.
 * @param ordered - PL: prawda dla listy numerowanej. EN: true for a numbered list.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: bezpieczna lista. EN: a safe list.
 */
function sanitizeList(node: Record<string, unknown>, ordered: boolean, depth: number): SafeBlock {
  const items = childrenOf(node)
    .filter((item): item is Record<string, unknown> => isRecord(item) && item.type === 'listItem')
    .map((item) => sanitizeBlocks(childrenOf(item), depth + 1));
  return { kind: 'list', ordered, items };
}

/**
 * PL: Czyści jeden blok. Nieznany typ albo przekroczona głębokość daje null.
 * EN: Cleans one block. An unknown type or an exceeded depth gives null.
 *
 * @param node - PL: węzeł dokumentu. EN: a document node.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: bezpieczny blok albo null. EN: a safe block or null.
 */
function sanitizeBlock(node: unknown, depth: number): SafeBlock | null {
  if (!isRecord(node) || depth > MAX_DEPTH) return null;
  switch (node.type) {
    case 'paragraph':
      return { kind: 'paragraph', children: inlineChildren(node) };
    case 'heading':
      return sanitizeHeading(node);
    case 'bulletList':
      return sanitizeList(node, false, depth);
    case 'orderedList':
      return sanitizeList(node, true, depth);
    case 'blockquote':
      return { kind: 'quote', children: sanitizeBlocks(childrenOf(node), depth + 1) };
    case 'youtube': {
      // PL: Film bez poprawnego identyfikatora znika.
      // EN: A video without a valid id disappears.
      const videoId = safeVideoId(isRecord(node.attrs) ? node.attrs.videoId : undefined);
      return videoId === null ? null : { kind: 'youtube', videoId };
    }
    default:
      // PL: Zdjęcia czekają na podtor 2 (media), a pozostałe typy nie są na liście dozwolonych.
      // EN: Photos wait for subtrack 2 (media), and the other types are not on the allowed list.
      return null;
  }
}

/**
 * PL: Czyści listę bloków, pomijając te niedozwolone.
 * EN: Cleans a list of blocks, skipping the disallowed ones.
 *
 * @param nodes - PL: węzły dokumentu. EN: document nodes.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: lista bezpiecznych bloków. EN: the list of safe blocks.
 */
function sanitizeBlocks(nodes: unknown[], depth: number): SafeBlock[] {
  return nodes.flatMap((node) => sanitizeBlock(node, depth) ?? []);
}

/**
 * PL: Czyści cały dokument wpisu. Wartość inna niż dokument daje pustą listę.
 * EN: Cleans a whole entry document. A value other than a document gives an empty list.
 *
 * @param value - PL: treść wpisu z serwera. EN: the entry content from the server.
 * @returns PL: lista bezpiecznych bloków. EN: the list of safe blocks.
 */
export function sanitizeDocument(value: unknown): SafeBlock[] {
  if (!isRecord(value) || value.type !== 'doc') return [];
  return sanitizeBlocks(childrenOf(value), 0);
}
