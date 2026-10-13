/**
 * PL: Wysyłka i wczytywanie wpisu z edytora w serwerze (POST, GET i PUT /api/news/editor/entries) i zamiana błędów na polski komunikat. Błąd sieci (brak internetu) odróżniamy od odpowiedzi serwera, bo wpis ma wtedy zostać w edytorze. Zapytania zapisujące nie są powtarzane same, żeby wpis nie zapisał się dwa razy.
 * EN: Sending and loading an entry of the editor on the server (POST, GET and PUT /api/news/editor/entries) and turning errors into a Polish message. A network error (no internet) is told apart from a server response, because the entry must then stay in the editor. Writing requests are not repeated by themselves, so an entry is not saved twice.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::sendEntry
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::loadDraft
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::updateEntry
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
  /** PL: Chwila zaplanowanej publikacji (milisekundy) albo null, gdy od razu. EN: The scheduled publication moment (milliseconds), or null for an immediate one. */
  publishAt?: number | null;
};

/**
 * PL: Szkic odczytany do edycji: to, co serwer oddaje z GET /entries/:id.
 * EN: A draft read for editing: what the server gives from GET /entries/:id.
 */
export type DraftToEdit = {
  /** PL: Numer szkicu. EN: The draft id. */
  id: string;
  /** PL: Typ wpisu. EN: The entry type. */
  type: string;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Zawsze szkic: opublikowanego wpisu serwer nie oddaje do edycji. EN: Always a draft: the server does not give a published entry for editing. */
  status: 'draft';
  /** PL: Treść: dokument JSON. EN: The content: a JSON document. */
  body: unknown;
};

/**
 * PL: Wynik wysyłki: sukces albo komunikat po polsku do pokazania pod przyciskiem.
 * EN: The sending result: success or a Polish message to show under the button.
 */
export type SendResult = { ok: true } | { ok: false; message: string };

/**
 * PL: Wynik wczytania szkicu: szkic albo komunikat po polsku do pokazania na ekranie.
 * EN: The loading result: the draft or a Polish message to show on the screen.
 */
export type LoadResult = { ok: true; draft: DraftToEdit } | { ok: false; message: string };

/**
 * PL: Adres jednego wpisu na serwerze. Numer wpisuje się w adres z kodowaniem, żeby nic nie wyszło poza ścieżkę.
 * EN: The address of one entry on the server. The id goes into the address encoded, so nothing leaves the path.
 *
 * @param id - PL: numer wpisu. EN: the entry id.
 * @returns PL: adres wpisu. EN: the entry address.
 */
function entryUrl(id: string): string {
  return `${ENTRIES_URL}/${encodeURIComponent(id)}`;
}

/**
 * PL: Zamienia odpowiedź serwera z błędem na komunikat po polsku. Nieznany kod daje komunikat zapasowy.
 * EN: Turns a server error response into a Polish message. An unknown code gives the fallback message.
 *
 * @param response - PL: odpowiedź z kodem innym niż 2xx. EN: a response with a non-2xx code.
 * @param fallback - PL: komunikat dla nieznanego błędu. EN: the message for an unknown error.
 * @returns PL: komunikat dla redaktora. EN: the message for the editor.
 */
async function messageForError(response: Response, fallback: string): Promise<string> {
  if (response.status === 401) return TO_AGREE.signedOut;
  if (response.status === 403) return TO_AGREE.forbidden;
  if (response.status === 404) return TO_AGREE.draftNotFound;
  if (response.status === 409) return TO_AGREE.alreadyPublished;
  if (response.status === 413) return TO_AGREE.rejected.too_large ?? fallback;
  if (response.status === 422) {
    // PL: Serwer podaje powód odrzucenia. Nieznany powód daje ogólny komunikat.
    // EN: The server gives the rejection reason. An unknown reason gives the general message.
    const data = (await response.json().catch(() => ({}))) as { reason?: string };
    return TO_AGREE.rejected[data.reason ?? ''] ?? fallback;
  }
  return fallback;
}

/**
 * PL: Wysyła wpis pod podany adres tą metodą. Wspólne dla zapisu nowego wpisu i zmian w szkicu.
 * EN: Sends the entry to the given address with the given method. Shared by saving a new entry and saving changes to a draft.
 *
 * @param url - PL: adres zapisu. EN: the save address.
 * @param method - PL: POST dla nowego wpisu, PUT dla zmian. EN: POST for a new entry, PUT for changes.
 * @param entry - PL: wpis z edytora. EN: the entry from the editor.
 * @returns PL: sukces albo komunikat błędu. EN: success or an error message.
 */
async function send(url: string, method: 'POST' | 'PUT', entry: EntryToSend): Promise<SendResult> {
  try {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
    return response.ok ? { ok: true } : { ok: false, message: await messageForError(response, TO_AGREE.failed) };
  } catch {
    // PL: Zapytanie nie dotarło do serwera: nie ma internetu. Wpis zostaje w edytorze.
    // EN: The request did not reach the server: there is no internet. The entry stays in the editor.
    return { ok: false, message: TO_AGREE.offline };
  }
}

/**
 * PL: Wysyła nowy wpis do serwera. Nie zmienia nic poza siecią i bazą serwera.
 * EN: Sends a new entry to the server. Changes nothing but the network and the server database.
 *
 * @param entry - PL: wpis z edytora. EN: the entry from the editor.
 * @returns PL: sukces albo komunikat błędu. EN: success or an error message.
 */
export function sendEntry(entry: EntryToSend): Promise<SendResult> {
  return send(ENTRIES_URL, 'POST', entry);
}

/**
 * PL: Zapisuje zmiany w istniejącym szkicu (ten sam wpis, bez nowego numeru). Opublikowany wpis serwer odrzuca komunikatem.
 * EN: Saves changes to an existing draft (the same entry, without a new id). The server rejects a published entry with a message.
 *
 * @param id - PL: numer szkicu. EN: the draft id.
 * @param entry - PL: wpis z edytora. EN: the entry from the editor.
 * @returns PL: sukces albo komunikat błędu. EN: success or an error message.
 */
export function updateEntry(id: string, entry: EntryToSend): Promise<SendResult> {
  return send(entryUrl(id), 'PUT', entry);
}

/**
 * PL: Wczytuje szkic do edycji. Opublikowany wpis albo brak wpisu daje komunikat zamiast szkicu.
 * EN: Loads a draft for editing. A published entry or a missing entry gives a message instead of a draft.
 *
 * @param id - PL: numer szkicu. EN: the draft id.
 * @returns PL: szkic albo komunikat błędu. EN: the draft or an error message.
 */
export async function loadDraft(id: string): Promise<LoadResult> {
  try {
    const response = await fetch(entryUrl(id));
    if (!response.ok) return { ok: false, message: await messageForError(response, TO_AGREE.draftLoadFailed) };
    return { ok: true, draft: (await response.json()) as DraftToEdit };
  } catch {
    // PL: Brak internetu przy wczytaniu: nic nie ma do pokazania poza komunikatem.
    // EN: No internet while loading: there is nothing to show but the message.
    return { ok: false, message: TO_AGREE.draftLoadFailed };
  }
}
