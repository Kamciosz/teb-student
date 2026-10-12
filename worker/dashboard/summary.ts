/**
 * PL: Zamienia odpowiedzi modułów aktualności, zgłoszeń i ankiet na dane kafelków pulpitu. Moduły nie wystawiają swoich typów, więc każdą odpowiedź czytamy ostrożnie: wiersz o złym kształcie jest pomijany, a nie psuje całego pulpitu.
 * EN: Turns the answers of the news, reports and surveys modules into the dashboard tile data. The modules do not expose their types, so we read every answer carefully: a row of a wrong shape is skipped instead of breaking the whole dashboard.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses worker/dashboard/types.ts::DashboardData
 * @used_by worker/dashboard/routes.ts::dashboardApp
 */

// PL: Typy danych kafelków.
// EN: The tile data types.
import type { AnnouncementRow, DashboardReport, DashboardSurvey, ImportantEntry } from './types';

/** PL: Ile ogłoszeń pokazuje kafel „Ogłoszenia”. EN: How many announcements the "Ogłoszenia" tile shows. */
export const ANNOUNCEMENT_LIMIT = 3;

/** PL: Typ wpisu, który trafia na kafel „Ważne” (kod z modułu aktualności). EN: The entry type that goes to the "Ważne" tile (the code from the news module). */
const IMPORTANT_TYPE = 'important';

/** PL: Kody etapów zgłoszenia w kolejności (kody z modułu zgłoszeń). Numer etapu to miejsce na liście plus 1. EN: The report stage codes in order (the codes from the reports module). The stage number is the position in the list plus 1. */
const REPORT_STAGES = ['received', 'in_progress', 'resolved'] as const;

/** PL: Wiersz odpowiedzi o nieznanym kształcie. EN: A row of an answer of an unknown shape. */
type Row = Record<string, unknown>;

/**
 * PL: Wyjmuje z odpowiedzi listę wierszy spod podanego klucza. Zły kształt daje pustą listę.
 * EN: Takes the list of rows under the given key from an answer. A wrong shape gives an empty list.
 *
 * @param payload - PL: odpowiedź modułu (JSON). EN: the module answer (JSON).
 * @param key - PL: nazwa pola z listą. EN: the name of the field with the list.
 * @returns PL: wiersze, które są obiektami. EN: the rows that are objects.
 */
function rowsOf(payload: unknown, key: string): Row[] {
  // PL: Odpowiedź musi być obiektem z polem-listą.
  // EN: The answer must be an object with a list field.
  if (typeof payload !== 'object' || payload === null) return [];
  const list = (payload as Row)[key];
  if (!Array.isArray(list)) return [];

  // PL: Zostaw tylko wiersze będące obiektami.
  // EN: Keep only the rows that are objects.
  return list.filter((row): row is Row => typeof row === 'object' && row !== null);
}

/**
 * PL: Czyta pole tekstowe wiersza.
 * EN: Reads a text field of a row.
 *
 * @returns PL: tekst albo null, gdy pola nie ma lub nie jest tekstem. EN: the text, or null when the field is missing or not a text.
 */
function text(row: Row, key: string): string | null {
  // PL: Tylko prawdziwy tekst jest poprawną wartością.
  // EN: Only a real text is a valid value.
  const value = row[key];
  return typeof value === 'string' ? value : null;
}

/**
 * PL: Buduje wiersz ogłoszenia z wiersza aktualności.
 * EN: Builds an announcement row from a news row.
 *
 * @returns PL: wiersz albo null, gdy brakuje numeru, tytułu lub daty. EN: the row, or null when the id, title or date is missing.
 */
function toAnnouncement(row: Row): AnnouncementRow | null {
  // PL: Bez numeru, tytułu i daty kafel nie ma co pokazać ani dokąd prowadzić.
  // EN: Without an id, title and date the tile has nothing to show and nowhere to lead.
  const id = text(row, 'id');
  const title = text(row, 'title');
  const publishedAt = text(row, 'publishedAt');
  return id === null || title === null || publishedAt === null ? null : { id, title, publishedAt };
}

/**
 * PL: Wybiera z listy aktualności najnowszy wpis „Ważne” i do trzech ostatnich wpisów. Moduł aktualności oddaje wpisy od najnowszego.
 * EN: Picks the newest "Ważne" entry and up to three latest entries from the news list. The news module returns entries newest first.
 *
 * @param payload - PL: odpowiedź GET /api/news/feed. EN: the GET /api/news/feed answer.
 * @returns PL: wpis „Ważne” (albo null) i ogłoszenia. EN: the "Ważne" entry (or null) and the announcements.
 */
export function summarizeNews(payload: unknown): { important: ImportantEntry | null; announcements: AnnouncementRow[] } {
  // PL: Wiersze z poprawnymi polami podstawowymi, w kolejności z modułu.
  // EN: The rows with valid basic fields, in the module's order.
  const rows = rowsOf(payload, 'entries').flatMap((row) => {
    const announcement = toAnnouncement(row);
    return announcement === null ? [] : [{ row, announcement }];
  });

  // PL: Pierwszy wpis „Ważne” na liście jest najnowszy. Źródło i fragment treści mogą być puste, więc dostają wartość domyślną.
  // EN: The first "Ważne" entry on the list is the newest. The source and the excerpt may be missing, so they get a default.
  const found = rows.find((item) => text(item.row, 'type') === IMPORTANT_TYPE);
  const important = found
    ? { ...found.announcement, excerpt: text(found.row, 'excerpt') ?? '', source: text(found.row, 'source') ?? '' }
    : null;

  // PL: Trzy pierwsze wpisy dowolnego typu to ogłoszenia.
  // EN: The first three entries of any type are the announcements.
  return { important, announcements: rows.slice(0, ANNOUNCEMENT_LIMIT).map((item) => item.announcement) };
}

/**
 * PL: Wybiera z listy ankiet pierwszą aktywną, której uczeń jeszcze nie wypełnił. Moduł ankiet oddaje aktywne od tych, którym zostało najmniej dni.
 * EN: Picks the first active survey from the list that the student has not filled in yet. The surveys module returns active ones starting with those that have the fewest days left.
 *
 * @param payload - PL: odpowiedź GET /api/surveys/vote. EN: the GET /api/surveys/vote answer.
 * @returns PL: ankieta albo null, gdy nie ma żadnej do wypełnienia. EN: the survey, or null when none is left to fill in.
 */
export function summarizeSurveys(payload: unknown): DashboardSurvey | null {
  // PL: Szukaj wśród aktywnych pierwszej bez głosu ucznia i z poprawnymi polami.
  // EN: Look among the active ones for the first without the student's vote and with valid fields.
  for (const row of rowsOf(payload, 'active')) {
    const id = text(row, 'id');
    const title = text(row, 'title');
    const daysLeft = row.daysLeft;
    if (row.hasVoted === false && id !== null && title !== null && typeof daysLeft === 'number') return { id, title, daysLeft };
  }

  // PL: Nic do wypełnienia: pusty kafel.
  // EN: Nothing to fill in: an empty tile.
  return null;
}

/**
 * PL: Wybiera z listy zgłoszeń ucznia to, które pokazuje kafel: najnowsze niezałatwione, a gdy wszystkie są załatwione, najnowsze. Moduł zgłoszeń oddaje zgłoszenia od najnowszego.
 * EN: Picks the report that the tile shows from the student's list: the newest unresolved one, or the newest when all are resolved. The reports module returns reports newest first.
 *
 * @param payload - PL: odpowiedź GET /api/reports/student. EN: the GET /api/reports/student answer.
 * @returns PL: zgłoszenie z liczbą niezałatwionych albo null, gdy uczeń nic nie zgłosił. EN: the report with the unresolved count, or null when the student reported nothing.
 */
export function summarizeReports(payload: unknown): DashboardReport | null {
  // PL: Zgłoszenia z treścią i znanym etapem. Numer etapu to miejsce kodu na liście etapów plus 1.
  // EN: The reports with a text and a known stage. The stage number is the code's position in the stage list plus 1.
  const reports = rowsOf(payload, 'reports').flatMap((row) => {
    const description = text(row, 'description');
    const stage = REPORT_STAGES.findIndex((code) => code === text(row, 'stage')) + 1;
    return description === null || stage === 0 ? [] : [{ description, stage }];
  });

  // PL: Niezałatwione są te przed ostatnim etapem.
  // EN: The unresolved ones are those before the last stage.
  const open = reports.filter((report) => report.stage < REPORT_STAGES.length);
  const shown = open[0] ?? reports[0];
  return shown ? { ...shown, openCount: open.length } : null;
}
