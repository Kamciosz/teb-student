/**
 * PL: Wysyłka wpisu z edytora do serwera (POST /api/news/editor/entries) i zamiana błędów na polski komunikat. Błąd sieci (brak internetu) odróżniamy od odpowiedzi serwera, bo wpis ma wtedy zostać w edytorze. Zapytanie zapisujące nie jest powtarzane samo, żeby wpis nie zapisał się dwa razy.
 * EN: Sending an entry from the editor to the server (POST /api/news/editor/entries) and turning errors into a Polish message. A network error (no internet) is told apart from a server response, because the entry must then stay in the editor. A writing request is not repeated by itself, so the entry is not saved twice.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::sendEntry
 */

import { TO_AGREE } from './texts';

// PL: Adres serwera edytora (worker/mounts.ts).
// EN: The editor server address (worker/mounts.ts).
const ENTRIES_URL = '/api/news/editor/entries';

/**
 * PL: Wpis do wysłania: to samo, co serwer sprawdza w worker/news/editor/validateEntry.ts.
 * EN: The entry to send: the same thing the server checks in worker/news/editor/validateEntry.ts.
 */
export type EntryToSend = {
  /** PL: Typ wpisu: important, news, event albo sport. EN: The entry type: important, news, event or sport. */
  type: string;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Szkic czy publikacja. EN: A draft or a publication. */
  status: 'draft' | 'published';
  /** PL: Treść: dokument JSON z edytora. EN: The content: the JSON document from the editor. */
  body: unknown;
};

/**
 * PL: Wynik wysyłki: sukces albo komunikat po polsku do pokazania pod przyciskiem.
 * EN: The sending result: success or a Polish message to show under the button.
 */
export type SendResult = { ok: true } | { ok: false; message: string };

/**
 * PL: Zamienia odpowiedź serwera z błędem na komunikat po polsku.
 * EN: Turns a server error response into a Polish message.
 *
 * @param response - PL: odpowiedź z kodem innym niż 2xx. EN: a response with a non-2xx code.
 * @returns PL: komunikat dla redaktora. EN: the message for the editor.
 */
async function messageForError(response: Response): Promise<string> {
  if (response.status === 401) return TO_AGREE.signedOut;
  if (response.status === 403) return TO_AGREE.forbidden;
  if (response.status === 413) return TO_AGREE.rejected.too_large ?? TO_AGREE.failed;
  if (response.status === 422) {
    // PL: Serwer podaje powód odrzucenia. Nieznany powód daje ogólny komunikat.
    // EN: The server gives the rejection reason. An unknown reason gives the general message.
    const data = (await response.json().catch(() => ({}))) as { reason?: string };
    return TO_AGREE.rejected[data.reason ?? ''] ?? TO_AGREE.failed;
  }
  return TO_AGREE.failed;
}

/**
 * PL: Wysyła wpis do serwera. Nie zmienia nic poza siecią i bazą serwera.
 * EN: Sends the entry to the server. Changes nothing but the network and the server database.
 *
 * @param entry - PL: wpis z edytora. EN: the entry from the editor.
 * @returns PL: sukces albo komunikat błędu. EN: success or an error message.
 */
export async function sendEntry(entry: EntryToSend): Promise<SendResult> {
  try {
    const response = await fetch(ENTRIES_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
    return response.ok ? { ok: true } : { ok: false, message: await messageForError(response) };
  } catch {
    // PL: Zapytanie nie dotarło do serwera: nie ma internetu. Wpis zostaje w edytorze.
    // EN: The request did not reach the server: there is no internet. The entry stays in the editor.
    return { ok: false, message: TO_AGREE.offline };
  }
}
