/**
 * PL: Czysta logika opisu i podpisu zdjęcia: przycina tekst do limitu tak, jak liczy go serwer (znaki UTF-16), buduje atrybuty węzła image, czyta zaznaczone zdjęcie i szuka zdjęcia w dokumencie.
 * EN: The pure logic of the photo description and caption: cuts the text to the limit the way the server counts it (UTF-16 units), builds the image node attributes, reads the selected photo and looks for a photo in the document.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/editor/document/limits.ts::MAX_CAPTION_CHARS
 * @used_by src/features/news/editor/PhotoCaptionPanel.tsx::captionAttrs
 * @used_by src/features/news/editor/EditorToolbar.tsx::selectedPhotoOf
 * @used_by src/features/news/editor/EditorToolbar.tsx::findPhotoPos
 */

import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { NodeSelection, type EditorState } from '@tiptap/pm/state';
import { MAX_CAPTION_CHARS } from './document/limits';

/**
 * PL: Atrybuty zdjęcia, które zapisuje okienko: opis dla czytnika ekranu i podpis.
 * EN: The photo attributes the panel saves: the screen reader description and the caption.
 */
export type CaptionAttrs = { alt: string; caption: string };

/**
 * PL: Zdjęcie zaznaczone w edytorze: adres i obecne opis oraz podpis.
 * EN: The photo selected in the editor: its address and the current description and caption.
 */
export type SelectedPhoto = CaptionAttrs & { src: string };

/**
 * PL: Przycina tekst do największej liczby znaków UTF-16. Nie rozcina pary znaków (np. emoji), bo wtedy zostałby pusty znak.
 * EN: Cuts the text to the largest number of UTF-16 units. It does not split a surrogate pair (e.g. an emoji), because that would leave a broken character.
 *
 * @param text - PL: tekst. EN: the text.
 * @param max - PL: najwięcej znaków. EN: the most characters.
 * @returns PL: przycięty tekst. EN: the cut text.
 */
export function clampText(text: string, max: number = MAX_CAPTION_CHARS): string {
  if (text.length <= max) return text;
  const last = text.charCodeAt(max - 1);
  const isHighSurrogate = last >= 0xd800 && last <= 0xdbff;
  return text.slice(0, isHighSurrogate ? max - 1 : max);
}

/**
 * PL: Buduje atrybuty zdjęcia z wpisanego tekstu: obcina spacje na końcach i przycina do limitu.
 * EN: Builds the photo attributes from the typed text: trims the spaces at the ends and cuts to the limit.
 *
 * @param alt - PL: opis zdjęcia. EN: the photo description.
 * @param caption - PL: podpis. EN: the caption.
 * @returns PL: atrybuty do updateAttributes. EN: the attributes for updateAttributes.
 */
export function captionAttrs(alt: string, caption: string): CaptionAttrs {
  return { alt: clampText(alt.trim()), caption: clampText(caption.trim()) };
}

/**
 * PL: Zwraca zaznaczone zdjęcie albo null, gdy zaznaczenie to nie zdjęcie.
 * EN: Returns the selected photo, or null when the selection is not a photo.
 *
 * @param state - PL: stan edytora. EN: the editor state.
 * @returns PL: zdjęcie albo null. EN: the photo or null.
 */
export function selectedPhotoOf(state: EditorState): SelectedPhoto | null {
  const selection = state.selection;
  if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') return null;
  const { src, alt, caption } = selection.node.attrs;
  return { src: String(src ?? ''), alt: String(alt ?? ''), caption: String(caption ?? '') };
}

/**
 * PL: Szuka w dokumencie pierwszego zdjęcia o podanym adresie i zwraca jego pozycję albo null.
 * EN: Looks for the first photo with the given address in the document and returns its position, or null.
 *
 * @param doc - PL: dokument. EN: the document.
 * @param src - PL: adres zdjęcia. EN: the photo address.
 * @returns PL: pozycja w dokumencie albo null. EN: the position in the document or null.
 */
export function findPhotoPos(doc: ProseMirrorNode, src: string): number | null {
  let found: number | null = null;
  doc.descendants((node, pos) => {
    if (found === null && node.type.name === 'image' && node.attrs.src === src) found = pos;
    return found === null;
  });
  return found;
}
