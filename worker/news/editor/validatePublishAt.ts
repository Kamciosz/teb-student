/**
 * PL: Sprawdzanie godziny zaplanowanej publikacji (publishAt). Pusta wartość znaczy „od razu”. Zaplanowana godzina musi być w przyszłości, najwyżej 30 dni naprzód, i dotyczy tylko publikacji, nie szkicu.
 * EN: Checking the scheduled publication time (publishAt). An empty value means "now". The scheduled time must be in the future, at most 30 days ahead, and applies only to a publication, not to a draft.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/news.ts::NEWS_ENTRY_STATUSES
 * @used_by worker/news/editor/validateEntry.ts::validateEntry
 * @used_by worker/news/editor/validatePublishAt.test.ts::validatePublishAt
 */

import type { NewsEntryStatus } from '../../db/schema/news';

// PL: Najdalej tyle milisekund w przód można zaplanować publikację: 30 dni.
// EN: The furthest ahead a publication can be scheduled, in milliseconds: 30 days.
export const MAX_PUBLISH_AHEAD_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * PL: Powód odrzucenia godziny publikacji: zły typ albo zła wartość, godzina w przeszłości, za daleko w przyszłości.
 * EN: The reason a publication time is rejected: a wrong type or value, a time in the past, too far in the future.
 */
export type PublishAtRejection = 'bad_publish_at' | 'publish_past' | 'publish_too_far';

/**
 * PL: Wynik sprawdzenia godziny publikacji: data do zapisu (null dla publikacji od razu i dla szkicu) albo powód odrzucenia.
 * EN: The check result of the publication time: the date to save (null for an immediate publication and for a draft) or the rejection reason.
 */
export type PublishAtResult = { ok: true; publishAt: Date | null } | { ok: false; reason: PublishAtRejection };

/**
 * PL: Sprawdza godzinę publikacji z telefonu. Liczba to milisekundy od 1970 roku (UTC), tak jak w JSON-ie z edytora.
 * EN: Checks the publication time from the phone. A number is milliseconds since 1970 (UTC), as in the JSON from the editor.
 *
 * @param value - PL: pole publishAt z telefonu (nieufne). EN: the publishAt field from the phone (untrusted).
 * @param status - PL: stan wpisu; szkic nie ma godziny publikacji. EN: the entry status; a draft has no publication time.
 * @param now - PL: teraz w milisekundach. EN: now in milliseconds.
 * @returns PL: godzina do zapisu albo powód odrzucenia. EN: the time to save or the rejection reason.
 */
export function validatePublishAt(value: unknown, status: NewsEntryStatus, now: number): PublishAtResult {
  // PL: Brak godziny znaczy publikację od razu albo szkic bez daty.
  // EN: No time means an immediate publication, or a draft without a date.
  if (value === undefined || value === null) return { ok: true, publishAt: null };
  if (status !== 'published') return { ok: false, reason: 'bad_publish_at' };
  if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, reason: 'bad_publish_at' };
  if (value <= now) return { ok: false, reason: 'publish_past' };
  if (value > now + MAX_PUBLISH_AHEAD_MS) return { ok: false, reason: 'publish_too_far' };
  return { ok: true, publishAt: new Date(value) };
}
