/**
 * PL: Czyszczenie HTML wklejonego z Worda (ADR 0002, „Wklejanie”). Word zapisuje listę jako zwykłe akapity z klasą „MsoListParagraph” i znakiem „·” w ukrytym elemencie, więc bez przeróbki lista wkleja się jako akapity. Funkcja zamienia takie akapity na listę punktowaną albo numerowaną i usuwa znaczniki „o:p”. Działa tylko w przeglądarce (DOMParser).
 * EN: Cleaning HTML pasted from Word (ADR 0002, "Wklejanie"). Word writes a list as plain paragraphs with the "MsoListParagraph" class and a "·" character in a hidden element, so without conversion a list pastes as paragraphs. The function turns such paragraphs into a bulleted or numbered list and removes "o:p" tags. It works only in the browser (DOMParser).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/editor/RichEditor.tsx::cleanPastedHtml
 */

// PL: Znacznik listy w Wordzie: akapit ze stylem „mso-list” innym niż „none”.
// EN: The Word list marker: a paragraph with an "mso-list" style other than "none".
const WORD_LIST_STYLE = /mso-list\s*:\s*(?!none)/i;

// PL: Znacznik numerowanej pozycji: cyfry albo litery z kropką lub nawiasem na początku tekstu.
// EN: The marker of a numbered item: digits or letters with a dot or a parenthesis at the start of the text.
const NUMBERED_MARKER = /^\s*[0-9a-zA-Z]+[.)]/;

/**
 * PL: Sprawdza, czy akapit jest pozycją listy z Worda.
 * EN: Checks whether a paragraph is a Word list item.
 *
 * @param element - PL: element z wklejonego HTML. EN: an element from the pasted HTML.
 * @returns PL: prawda dla pozycji listy. EN: true for a list item.
 */
function isWordListItem(element: Element | null): element is HTMLParagraphElement {
  return element instanceof HTMLParagraphElement && WORD_LIST_STYLE.test(element.getAttribute('style') ?? '');
}

/**
 * PL: Zamienia ciąg sąsiednich akapitów-pozycji z Worda na jedną listę.
 * EN: Turns a run of adjacent Word list item paragraphs into one list.
 *
 * @param first - PL: pierwszy akapit ciągu. EN: the first paragraph of the run.
 * @param document - PL: dokument, w którym budujemy listę. EN: the document the list is built in.
 */
function convertRun(first: HTMLParagraphElement, document: Document): void {
  // PL: Lista jest numerowana, gdy ukryty znacznik pierwszej pozycji wygląda jak „1.” albo „a)”.
  // EN: The list is numbered when the hidden marker of the first item looks like "1." or "a)".
  const marker = first.querySelector('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]')?.textContent ?? '';
  const list = document.createElement(NUMBERED_MARKER.test(marker) ? 'ol' : 'ul');
  first.before(list);
  // PL: Dopóki następny element to pozycja listy, przenieś ją do <li> bez znacznika.
  // EN: While the next element is a list item, move it into an <li> without the marker.
  let current: Element | null = first;
  while (isWordListItem(current)) {
    const next: Element | null = current.nextElementSibling;
    current.querySelectorAll('[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]').forEach((node) => node.remove());
    const item = document.createElement('li');
    item.innerHTML = current.innerHTML;
    list.append(item);
    current.remove();
    current = next;
  }
}

/**
 * PL: Czyści HTML wklejony do edytora: usuwa śmieci Worda i zamienia jego listy na prawdziwe listy.
 * EN: Cleans HTML pasted into the editor: removes the Word junk and turns its lists into real lists.
 *
 * @param html - PL: HTML ze schowka. EN: the HTML from the clipboard.
 * @returns PL: HTML po przeróbce. EN: the HTML after conversion.
 */
export function cleanPastedHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  // PL: Usuń znaczniki, które nic nie wnoszą do treści.
  // EN: Remove the tags that add nothing to the content.
  parsed.querySelectorAll('o\\:p, style, meta, link, script, xml').forEach((node) => node.remove());
  // PL: Każdy ciąg pozycji listy z Worda staje się jedną listą.
  // EN: Every run of Word list items becomes one list.
  for (const paragraph of Array.from(parsed.body.querySelectorAll('p'))) {
    if (paragraph.isConnected && isWordListItem(paragraph)) convertRun(paragraph, parsed);
  }
  return parsed.body.innerHTML;
}
