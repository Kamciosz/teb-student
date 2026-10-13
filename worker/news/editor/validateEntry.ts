/**
 * PL: Sprawdzanie całego wpisu od telefonu: typ, tytuł, stan (szkic albo publikacja) i treść. Treść sprawdza validateBody. Wszystko, co przychodzi z telefonu, jest nieufne, więc każde pole jest sprawdzane na serwerze, także to, które ekran już sprawdził.
 * EN: Checking a whole entry from the phone: the type, title, status (draft or publication) and content. validateBody checks the content. Everything that comes from the phone is untrusted, so every field is checked on the server, also the one the screen already checked.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/news/editor/validateBody.ts::validateBody
 * @uses worker/db/schema/news.ts::NEWS_ENTRY_TYPES
 * @used_by worker/news/editor/routes.ts::validateEntry
 * @used_by worker/news/editor/validateEntry.test.ts::validateEntry
 */

// PL: Dozwolone typy i stany wpisu z schematu bazy.
// EN: The allowed entry types and statuses from the database schema.
import { NEWS_ENTRY_STATUSES, NEWS_ENTRY_TYPES, type NewsEntryStatus, type NewsEntryType } from '../../db/schema/news';
import { MAX_TITLE_CHARS } from '../../../src/features/news/editor/document/limits';
import { validateBody, type BodyRejection } from './validateBody';
import { validatePublishAt, type PublishAtRejection } from './validatePublishAt';

/**
 * PL: Wpis po sprawdzeniu, gotowy do zapisu w bazie.
 * EN: An entry after the check, ready to be saved in the database.
 */
export type CheckedEntry = {
  /** PL: Typ wpisu. EN: The entry type. */
  type: NewsEntryType;
  /** PL: Tytuł bez białych znaków na brzegach. EN: The title without whitespace at the edges. */
  title: string;
  /** PL: Stan: szkic albo publikacja. EN: The status: draft or publication. */
  status: NewsEntryStatus;
  /** PL: Treść odczytana przez schemat. EN: The content as read by the schema. */
  body: Record<string, unknown>;
  /** PL: Zaplanowana godzina publikacji albo null (od razu i dla szkicu). EN: The scheduled publication time, or null (immediately, and for a draft). */
  publishAt: Date | null;
};

/**
 * PL: Powód odrzucenia wpisu: błąd treści albo jedno z pól wpisu.
 * EN: The reason an entry is rejected: a content error or one of the entry fields.
 */
export type EntryRejection = BodyRejection | PublishAtRejection | 'bad_type' | 'bad_status' | 'bad_title';

/**
 * PL: Wynik sprawdzenia wpisu.
 * EN: The entry check result.
 */
export type EntryResult = { ok: true; entry: CheckedEntry } | { ok: false; reason: EntryRejection };

/**
 * PL: Sprawdza wpis z ciała zapytania. Nic nie zapisuje.
 * EN: Checks an entry from the request body. Saves nothing.
 *
 * @param value - PL: obiekt JSON z telefonu (nieufny). EN: the JSON object from the phone (untrusted).
 * @param now - PL: teraz w milisekundach (domyślnie zegar). EN: now in milliseconds (the clock by default).
 * @returns PL: wpis do zapisu albo powód odrzucenia. EN: the entry to save or the rejection reason.
 */
export function validateEntry(value: unknown, now: number = Date.now()): EntryResult {
  // PL: Ciało musi być obiektem.
  // EN: The body must be an object.
  if (typeof value !== 'object' || value === null) return { ok: false, reason: 'bad_type' };
  const { type, title, status, body, publishAt } = value as Record<string, unknown>;
  // PL: Typ i stan muszą być jednym z dozwolonych napisów.
  // EN: The type and the status must be one of the allowed strings.
  if (!NEWS_ENTRY_TYPES.includes(type as NewsEntryType)) return { ok: false, reason: 'bad_type' };
  if (!NEWS_ENTRY_STATUSES.includes(status as NewsEntryStatus)) return { ok: false, reason: 'bad_status' };
  // PL: Tytuł: niepusty tekst, nie dłuższy niż limit.
  // EN: The title: a non-empty text, not longer than the limit.
  const cleanTitle = typeof title === 'string' ? title.trim() : '';
  if (cleanTitle === '' || cleanTitle.length > MAX_TITLE_CHARS) return { ok: false, reason: 'bad_title' };
  // PL: Godzina publikacji: pusta znaczy od razu, zaplanowana musi być w przyszłości i najwyżej 30 dni naprzód.
  // EN: The publication time: empty means now, a scheduled one must be in the future and at most 30 days ahead.
  const checkedPublishAt = validatePublishAt(publishAt, status as NewsEntryStatus, now);
  if (!checkedPublishAt.ok) return checkedPublishAt;
  // PL: Treść sprawdza schemat i dodatkowe zasady.
  // EN: The schema and the extra rules check the content.
  const checkedBody = validateBody(body);
  if (!checkedBody.ok) return checkedBody;
  return { ok: true, entry: { type: type as NewsEntryType, title: cleanTitle, status: status as NewsEntryStatus, body: checkedBody.body, publishAt: checkedPublishAt.publishAt } };
}
