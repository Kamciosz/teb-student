/**
 * PL: Sprawdzanie treści wpisu na serwerze. Serwer nie ufa dokumentowi od telefonu: buduje schemat z listy dozwolonych elementów (ta sama lista co w edytorze), wykonuje na dokumencie Node.fromJSON(...).check() i do tego sprawdza to, czego schemat nie sprawdza: adresy https w linkach, zdjęciach i źródłach, identyfikator filmu, serwis karty linku oraz limity rozmiaru. Zwraca dokument odczytany przez schemat (toJSON), więc pola spoza schematu nie trafiają do bazy.
 * EN: Entry content check on the server. The server does not trust the document from the phone: it builds a schema from the allowed element list (the same list as in the editor), runs Node.fromJSON(...).check() on the document and also checks what the schema does not: https addresses in links, photos and sources, the video id, the link card network and the size limits. It returns the document as read by the schema (toJSON), so fields outside the schema never reach the database.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/extensions.ts::NEWS_EXTENSIONS
 * @uses src/features/news/editor/document/urls.ts::normalizeHttpsUrl
 * @uses src/features/news/editor/document/limits.ts::MAX_BODY_BYTES
 * @used_by worker/news/editor/validateEntry.ts::validateBody
 * @used_by worker/news/editor/validateBody.test.ts::validateBody
 */

// PL: getSchema buduje schemat ProseMirror z listy rozszerzeń, bez przeglądarki. Node czyta i sprawdza dokument.
// EN: getSchema builds the ProseMirror schema from the extension list, without a browser. Node reads and checks the document.
import { getSchema } from '@tiptap/core';
import { Node as ProseNode } from '@tiptap/pm/model';
// PL: Lista dozwolonych elementów, limity i sprawdzanie adresów, wspólne z telefonem.
// EN: The allowed element list, the limits and the address checks, shared with the phone.
import { NEWS_EXTENSIONS } from '../../../src/features/news/editor/document/extensions';
import { MAX_BODY_BYTES, MAX_CAPTION_CHARS, MAX_DEPTH, MAX_IMAGE_SIDE, MAX_SOURCES, MAX_TEXT_CHARS } from '../../../src/features/news/editor/document/limits';
import { YOUTUBE_ID_PATTERN, normalizeHttpsUrl, socialNetworkName } from '../../../src/features/news/editor/document/urls';

/**
 * PL: Powody odrzucenia treści. Telefon zamienia je na polski komunikat, serwer zwraca sam kod.
 * EN: The reasons for rejecting content. The phone turns them into a Polish message, the server returns only the code.
 */
export type BodyRejection = 'not_a_document' | 'too_large' | 'too_deep' | 'schema' | 'bad_link' | 'bad_video' | 'bad_image' | 'bad_card' | 'bad_sources' | 'too_long' | 'empty';

/**
 * PL: Wynik sprawdzenia: dokument gotowy do zapisu albo powód odrzucenia.
 * EN: The check result: a document ready to be saved, or the rejection reason.
 */
export type BodyResult = { ok: true; body: Record<string, unknown> } | { ok: false; reason: BodyRejection };

// PL: Schemat budujemy raz na proces Workera, bo jest drogi, a lista elementów się nie zmienia.
// EN: We build the schema once per Worker process, because it is costly and the element list does not change.
const schema = getSchema(NEWS_EXTENSIONS);

/**
 * PL: Sprawdza, czy zagnieżdżenie surowego dokumentu przekracza limit. Robi to przed budową węzłów, żeby złośliwy dokument nie zajął serwera.
 * EN: Checks whether the nesting of the raw document exceeds the limit. It runs before the nodes are built, so a malicious document cannot busy the server.
 *
 * @param value - PL: węzeł surowego dokumentu. EN: a raw document node.
 * @param depth - PL: obecna głębokość. EN: the current depth.
 * @returns PL: prawda, gdy jest za głęboko. EN: true when it is too deep.
 */
function isTooDeep(value: unknown, depth: number): boolean {
  if (depth > MAX_DEPTH) return true;
  const content = (value as { content?: unknown } | null)?.content;
  return Array.isArray(content) && content.some((child) => isTooDeep(child, depth + 1));
}

/**
 * PL: Sprawdza pola zdjęcia: adres https, podpis i opis jako krótki tekst, wymiary jako liczby całkowite albo puste.
 * EN: Checks the photo fields: an https address, the caption and the description as short text, the dimensions as integers or empty.
 *
 * @param attrs - PL: pola węzła zdjęcia. EN: the photo node fields.
 * @returns PL: prawda, gdy wszystkie pola są poprawne. EN: true when all the fields are valid.
 */
function isImageValid(attrs: Record<string, unknown>): boolean {
  const isShortText = (value: unknown) => typeof value === 'string' && value.length <= MAX_CAPTION_CHARS;
  const isSize = (value: unknown) => value === null || (Number.isInteger(value) && (value as number) > 0 && (value as number) <= MAX_IMAGE_SIDE);
  return normalizeHttpsUrl(attrs.src) !== null && isShortText(attrs.caption) && isShortText(attrs.alt) && isSize(attrs.width) && isSize(attrs.height);
}

/**
 * PL: Sprawdza atrybuty jednego węzła i jego znaczniki (adresy, identyfikator filmu, karta, źródła).
 * EN: Checks the attributes of one node and its marks (addresses, the video id, the card, the sources).
 *
 * @param node - PL: węzeł dokumentu po sprawdzeniu przez schemat. EN: a document node after the schema check.
 * @returns PL: powód odrzucenia albo null, gdy węzeł jest w porządku. EN: the rejection reason, or null when the node is fine.
 */
function checkNode(node: ProseNode): BodyRejection | null {
  // PL: Każdy link w tekście musi mieć adres https.
  // EN: Every link in the text must have an https address.
  if (node.marks.some((mark) => mark.type.name === 'link' && normalizeHttpsUrl(mark.attrs.href) === null)) return 'bad_link';
  const attrs = node.attrs;
  switch (node.type.name) {
    case 'youtube':
      // PL: Film: tylko tekst z identyfikatorem z 11 znaków, nie adres i nie brak wartości (null).
      // EN: A video: only text with an 11-character id, not an address and not a missing value (null).
      return typeof attrs.videoId === 'string' && YOUTUBE_ID_PATTERN.test(attrs.videoId) ? null : 'bad_video';
    case 'heading':
      // PL: Schemat nie sprawdza wartości pól, więc poziom nagłówka pilnujemy sami: 2 albo 3 (h1 to tytuł wpisu).
      // EN: The schema does not check field values, so we guard the heading level ourselves: 2 or 3 (h1 is the entry title).
      return attrs.level === 2 || attrs.level === 3 ? null : 'schema';
    case 'image':
      return isImageValid(attrs) ? null : 'bad_image';
    case 'linkCard':
      return socialNetworkName(attrs.href) === null ? 'bad_card' : null;
    case 'sources': {
      const urls: unknown = attrs.urls;
      const isValid = Array.isArray(urls) && urls.length > 0 && urls.length <= MAX_SOURCES && urls.every((url) => normalizeHttpsUrl(url) !== null);
      return isValid ? null : 'bad_sources';
    }
    default:
      return null;
  }
}

/**
 * PL: Przechodzi po wszystkich węzłach dokumentu i zwraca pierwszy powód odrzucenia.
 * EN: Walks over all nodes of the document and returns the first rejection reason.
 *
 * @param doc - PL: dokument po sprawdzeniu przez schemat. EN: the document after the schema check.
 * @returns PL: powód odrzucenia albo null. EN: the rejection reason or null.
 */
function findProblem(doc: ProseNode): BodyRejection | null {
  let problem: BodyRejection | null = null;
  let hasContent = false;
  doc.descendants((node) => {
    // PL: Po znalezieniu błędu nie schodzimy głębiej.
    // EN: After an error is found we do not go deeper.
    if (problem !== null) return false;
    problem = checkNode(node);
    if (node.isText || node.isAtom) hasContent = true;
    return problem === null;
  });
  if (problem !== null) return problem;
  // PL: Wpis bez żadnego tekstu i bez filmu, zdjęcia, karty albo źródeł jest pusty.
  // EN: An entry without any text and without a video, photo, card or sources is empty.
  if (!hasContent || (doc.textContent.trim() === '' && !doc.content.content.some((child) => child.isAtom))) return 'empty';
  return doc.textContent.length > MAX_TEXT_CHARS ? 'too_long' : null;
}

/**
 * PL: Sprawdza treść wpisu od telefonu. Nie zmienia nic poza wynikiem.
 * EN: Checks the entry content from the phone. Changes nothing but the result.
 *
 * @param value - PL: dokument z ciała zapytania (nieufny). EN: the document from the request body (untrusted).
 * @returns PL: dokument do zapisu albo powód odrzucenia. EN: the document to save or the rejection reason.
 */
export function validateBody(value: unknown): BodyResult {
  // PL: Dokument musi być obiektem typu „doc”.
  // EN: The document must be an object of the "doc" type.
  if (typeof value !== 'object' || value === null || (value as { type?: unknown }).type !== 'doc') return { ok: false, reason: 'not_a_document' };
  // PL: Rozmiar i głębokość sprawdzamy, zanim zaczniemy budować węzły.
  // EN: We check the size and depth before we start building the nodes.
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_BODY_BYTES) return { ok: false, reason: 'too_large' };
  if (isTooDeep(value, 0)) return { ok: false, reason: 'too_deep' };
  try {
    // PL: Schemat odrzuca nieznane węzły, znaczniki i złą strukturę (na przykład pozycję listy poza listą).
    // EN: The schema rejects unknown nodes, marks and a wrong structure (for example a list item outside a list).
    const doc = ProseNode.fromJSON(schema, value);
    doc.check();
    const reason = findProblem(doc);
    return reason === null ? { ok: true, body: doc.toJSON() as Record<string, unknown> } : { ok: false, reason };
  } catch {
    return { ok: false, reason: 'schema' };
  }
}
