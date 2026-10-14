/**
 * PL: Zamienia wynik wysyłki zdjęcia w węzeł „image” dla edytora i wybiera komunikat błędu dla paska. Funkcje są czyste (bez Reacta i Tiptapa), więc test je sprawdza bez przeglądarki.
 * EN: Turns the result of a photo upload into an "image" node for the editor and picks the error message for the toolbar. The functions are pure (no React, no Tiptap), so a test checks them without a browser.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/media/index.ts::EditorPhoto
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/PhotoButton.tsx::photoImageNode
 * @used_by src/features/news/editor/PhotoButton.tsx::photoErrorMessage
 * @used_by src/features/news/editor/photoNode.test.ts::photoImageNode
 */

// PL: Typ zdjęcia z modułu media (tylko typ, bez kodu).
// EN: The photo type from the media module (only the type, no code).
import type { EditorPhoto } from '../../media';
import { TO_AGREE } from './texts';

/** PL: Węzeł zdjęcia do wstawienia przez insertContent. EN: The photo node to insert with insertContent. */
export type PhotoNode = {
  type: 'image';
  attrs: { src: string; width: number | null; height: number | null; alt: string; caption: string };
};

/**
 * PL: Buduje węzeł zdjęcia. Opis i podpis zostają puste, bo okienko na nie nie jest jeszcze zrobione.
 * EN: Builds the photo node. The description and the caption stay empty, because the panel for them is not done yet.
 *
 * @param photo - PL: zdjęcie po wysyłce. EN: the photo after the upload.
 * @returns PL: węzeł „image”. EN: the "image" node.
 */
export function photoImageNode(photo: EditorPhoto): PhotoNode {
  return { type: 'image', attrs: { src: photo.src, width: photo.width, height: photo.height, alt: '', caption: '' } };
}

/**
 * PL: Zwraca komunikat dla paska. Tekst z wyjątku pokazujemy tylko wtedy, gdy to zwykły błąd z polskim komunikatem z modułu media. Inne błędy (np. SyntaxError, gdy serwer odda nieczytelną odpowiedź) dostają ogólny tekst, żeby po angielsku nie wyszło nic w pasku.
 * EN: Returns the message for the toolbar. The text of an exception is shown only for a plain error with the Polish message from the media module. Other errors (e.g. a SyntaxError when the server returns an unreadable answer) get the generic text, so nothing in English reaches the toolbar.
 *
 * @param failure - PL: to, co rzuciło wysyłkę. EN: what the upload threw.
 * @returns PL: komunikat po polsku. EN: the message in Polish.
 */
export function photoErrorMessage(failure: unknown): string {
  return failure instanceof Error && failure.constructor === Error ? failure.message : TO_AGREE.photo.failed;
}
