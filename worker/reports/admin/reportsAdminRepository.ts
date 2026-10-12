/**
 * PL: Dostęp do bazy dla zgłoszeń w panelu: lista, szczegół z historią i zmiana etapu. Tylko ten plik pisze zapytania SQL podtoru 4b. Żadne zapytanie nie wybiera numeru autora, więc anonimowość nie zależy od tego, czy trasa o niej pamięta.
 * EN: Database access for reports in the panel: the list, the detail with its history and the stage change. Only this file writes the SQL queries of subtrack 4b. No query selects the author id, so anonymity does not depend on a route remembering it.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportStageChanges
 * @used_by worker/reports/admin/routes.ts::listReports
 * @used_by worker/reports/admin/routes.ts::getReport
 * @used_by worker/reports/admin/routes.ts::changeReportStage
 */

// PL: desc sortuje malejąco, eq porównuje wartości w warunku WHERE.
// EN: desc sorts in descending order, eq compares values in a WHERE condition.
import { desc, eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele i typy modułu (schemat należy do podtoru 4a, tu tylko czytamy).
// EN: The module tables and types (the schema belongs to subtrack 4a, here we only read it).
import { reports, reportStageChanges, type ReportCategory, type ReportPlace, type ReportStage } from '../../db/schema/reports';

/**
 * PL: Zgłoszenie w takiej postaci, w jakiej wraca do panelu. Celowo nie ma tu numeru autora, także przy zgłoszeniu z autorem: nazwisko i klasę poda dopiero drzwi modułu profilu.
 * EN: A report in the form that goes back to the panel. There is deliberately no author id, even for a report with an author: the name and class will come only from the profile module's door.
 */
export type CouncilReport = {
  /** PL: Numer zgłoszenia. EN: The report id. */
  id: string;
  /** PL: Czy zgłoszenie jest anonimowe. EN: Whether the report is anonymous. */
  isAnonymous: boolean;
  /** PL: Czego dotyczy zgłoszenie. EN: What the report is about. */
  category: ReportCategory;
  /** PL: Gdzie jest problem. EN: Where the problem is. */
  place: ReportPlace;
  /** PL: Dokładne miejsce albo `null`. EN: The exact place or `null`. */
  placeDetail: string | null;
  /** PL: Opis problemu. EN: The problem description. */
  description: string;
  /** PL: Bieżący etap. EN: The current stage. */
  stage: ReportStage;
  /** PL: Chwila wysłania, milisekundy od 1970. EN: When the report was sent, milliseconds since 1970. */
  createdAt: number;
  /** PL: Chwila ostatniej zmiany etapu, milisekundy od 1970. EN: When the stage last changed, milliseconds since 1970. */
  updatedAt: number;
};

/** PL: Jeden wiersz historii etapów. EN: One row of the stage history. */
export type StageChange = {
  /** PL: Etap, na który zgłoszenie weszło. EN: The stage the report moved to. */
  stage: ReportStage;
  /** PL: Chwila zmiany, milisekundy od 1970. EN: When the change happened, milliseconds since 1970. */
  changedAt: number;
};

/** PL: Wynik zmiany etapu. EN: The result of a stage change. */
export type StageChangeResult = 'not_found' | 'changed' | 'unchanged';

/**
 * PL: Pola zgłoszenia, które wolno oddać panelowi. Jedno miejsce na listę pól, więc nowe pole autora nie trafi tu przez przypadek.
 * EN: The report fields the panel may get. One place for the field list, so a new author field cannot get here by accident.
 */
const COUNCIL_FIELDS = {
  id: reports.id,
  isAnonymous: reports.isAnonymous,
  category: reports.category,
  place: reports.place,
  placeDetail: reports.placeDetail,
  description: reports.description,
  stage: reports.stage,
  createdAt: reports.createdAt,
  updatedAt: reports.updatedAt,
};

/**
 * PL: Czyta wszystkie zgłoszenia, od najnowszego.
 * EN: Reads all reports, newest first.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @returns PL: lista zgłoszeń bez numeru autora. EN: the list of reports without the author id.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function listReports(db: D1Database): Promise<CouncilReport[]> {
  // PL: Wybierz tylko dozwolone pola i posortuj od najnowszego.
  // EN: Select only the allowed fields and sort from the newest.
  return drizzle(db).select(COUNCIL_FIELDS).from(reports).orderBy(desc(reports.createdAt));
}

/**
 * PL: Czyta jedno zgłoszenie razem z historią etapów, od najnowszego etapu.
 * EN: Reads one report together with its stage history, newest stage first.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: zgłoszenie i historia albo `null`, gdy nie ma takiego zgłoszenia. EN: the report and the history, or `null` when there is no such report.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function getReport(db: D1Database, id: string): Promise<{ report: CouncilReport; history: StageChange[] } | null> {
  // PL: Najpierw zgłoszenie; bez niego nie ma po co czytać historii.
  // EN: The report first; without it there is no point reading the history.
  const [report] = await drizzle(db).select(COUNCIL_FIELDS).from(reports).where(eq(reports.id, id));
  if (!report) return null;

  // PL: Historia: etap i chwila, bez osoby, która go zmieniła.
  // EN: The history: the stage and the moment, without the person who changed it.
  const history = await drizzle(db)
    .select({ stage: reportStageChanges.stage, changedAt: reportStageChanges.changedAt })
    .from(reportStageChanges)
    .where(eq(reportStageChanges.reportId, id))
    .orderBy(desc(reportStageChanges.changedAt));
  return { report, history };
}

/**
 * PL: Zmienia etap zgłoszenia. Etap, czas zmiany i nowy wiersz historii idą w jednym `batch`, więc albo są wszystkie, albo żaden. Ten sam etap nie zmienia nic i nie dopisuje historii.
 * EN: Changes a report's stage. The stage, the change time and the new history row go in one `batch`, so either all exist or none. The same stage changes nothing and adds no history.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param change - PL: numer zgłoszenia, nowy etap i numer osoby z Samorządu. EN: the report id, the new stage and the Student Council member's id.
 * @returns PL: `not_found`, `unchanged` albo `changed`. EN: `not_found`, `unchanged` or `changed`.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the write fails.
 */
export async function changeReportStage(db: D1Database, change: { id: string; stage: ReportStage; memberId: string }): Promise<StageChangeResult> {
  // PL: Sprawdź, czy zgłoszenie istnieje i czy etap w ogóle się zmienia.
  // EN: Check that the report exists and that the stage really changes.
  const [current] = await drizzle(db).select({ stage: reports.stage }).from(reports).where(eq(reports.id, change.id));
  if (!current) return 'not_found';
  if (current.stage === change.stage) return 'unchanged';

  // PL: Zapisz etap i wiersz historii razem.
  // EN: Save the stage and the history row together.
  const now = Date.now();
  await drizzle(db).batch([
    drizzle(db).update(reports).set({ stage: change.stage, updatedAt: now }).where(eq(reports.id, change.id)),
    drizzle(db).insert(reportStageChanges).values({ id: crypto.randomUUID(), reportId: change.id, stage: change.stage, changedBy: change.memberId, changedAt: now }),
  ]);
  return 'changed';
}
