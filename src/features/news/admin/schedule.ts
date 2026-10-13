/**
 * PL: Znacznik zaplanowanego wpisu na liście panelu. Opublikowany wpis, którego chwila startu jest w przyszłości, dostaje „Zaplanowany na D.MM, HH:mm” w strefie Europe/Warsaw, niezależnie od strefy telefonu. Szkic nie dostaje znacznika, nawet gdy ma chwilę startu.
 * EN: The scheduled tag of an entry on the panel list. A published entry whose start moment is in the future gets "Zaplanowany na D.MM, HH:mm" in the Europe/Warsaw zone, whatever the phone's zone. A draft gets no tag, even when it has a start moment.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/admin/api.ts::PanelEntry
 * @uses src/features/news/admin/texts.ts::TO_AGREE
 * @used_by src/features/news/admin/EntryTile.tsx::EntryTile
 * @used_by src/features/news/admin/schedule.test.ts::formatScheduled
 */

// PL: Typ wpisu listy panelu i teksty znacznika.
// EN: The panel list entry type and the tag texts.
import type { PanelEntry } from './api';
import { TO_AGREE } from './texts';

/** PL: Strefa szkoły: od niej zależy, o której godzinie uczeń zobaczy wpis. EN: The school zone: it decides the hour the student sees the entry. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/**
 * PL: Składa chwilę w tekst „dzień.miesiąc, godzina:minuta” w strefie szkoły. Części składamy sami, bo gotowy wzorzec daty z godziną zależy od wersji ICU w przeglądarce.
 * EN: Builds the moment into the text "day.month, hour:minute" in the school zone. We assemble the parts ourselves, because a ready date-and-time pattern depends on the ICU version in the browser.
 *
 * @param iso - PL: chwila jako tekst ISO 8601. EN: the moment as an ISO 8601 string.
 * @returns PL: na przykład „25.10, 01:00”. EN: for example "25.10, 01:00".
 */
export function formatScheduled(iso: string): string {
  // PL: Godzina 0-23, żeby północ była „00”, a nie „24”.
  // EN: Hours 0-23, so midnight is "00" and not "24".
  const parts = new Intl.DateTimeFormat('pl-PL', {
    timeZone: SCHOOL_TIME_ZONE,
    day: 'numeric',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}.${part('month')}, ${part('hour')}:${part('minute')}`;
}

/**
 * PL: Czy wpis jest zaplanowany: opublikowany i z chwilą startu późniejszą niż „teraz”. Chwila równa „teraz” już nie jest zaplanowana.
 * EN: Whether the entry is scheduled: published, with a start moment later than "now". A moment equal to "now" is no longer scheduled.
 *
 * @param entry - PL: wpis z listy panelu. EN: the entry from the panel list.
 * @param now - PL: chwila porównania w milisekundach od epoki. EN: the comparison moment in milliseconds since the epoch.
 * @returns PL: prawda, gdy wpis czeka na swoją chwilę. EN: true when the entry is waiting for its moment.
 */
export function isScheduled(entry: PanelEntry, now: number = Date.now()): boolean {
  return entry.status === 'published' && entry.publishAt !== null && Date.parse(entry.publishAt) > now;
}

/**
 * PL: Tekst znacznika zaplanowania albo null, gdy wpis nie jest zaplanowany.
 * EN: The scheduled tag text, or null when the entry is not scheduled.
 *
 * @param entry - PL: wpis z listy panelu. EN: the entry from the panel list.
 * @param now - PL: chwila porównania w milisekundach od epoki; domyślnie teraz. EN: the comparison moment in milliseconds since the epoch; defaults to now.
 * @returns PL: na przykład „Zaplanowany na 25.10, 01:00”, albo null. EN: for example "Zaplanowany na 25.10, 01:00", or null.
 */
export function scheduledLabel(entry: PanelEntry, now?: number): string | null {
  return isScheduled(entry, now) && entry.publishAt !== null ? TO_AGREE.scheduled(formatScheduled(entry.publishAt)) : null;
}
