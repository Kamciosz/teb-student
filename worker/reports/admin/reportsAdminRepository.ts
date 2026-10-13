/**
 * PL: Dostęp do bazy dla zgłoszeń w panelu: lista, szczegół z historią i zmiana etapu. Tylko ten plik pisze zapytania SQL podtoru 4b. Numer autora czytamy tylko przy zgłoszeniu nieanonimowym, żeby oddać imię i klasę z modułu profilu. Sam numer nigdy nie wychodzi z tego pliku, a przy anonimowym nie czytamy go wcale.
 * EN: Database access for reports in the panel: the list, the detail with its history and the stage change. Only this file writes the SQL queries of subtrack 4b. We read the author id only for a signed report, to return the name and class from the profile module. The id itself never leaves this file, and for an anonymous report we do not read it at all.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportStageChanges
 * @uses worker/profile/index.ts::getStudentNames
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
// PL: Imiona i klasy uczniów z modułu profilu, przez jego drzwi (index.ts).
// EN: The names and classes of students from the profile module, through its door (index.ts).
import { getStudentNames } from '../../profile';

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

/** PL: Imię i klasa autora zgłoszenia nieanonimowego. EN: The name and class of the author of a signed report. */
export type CouncilStudent = {
  /** PL: Imię ucznia, pusty tekst, gdy go nie podał. EN: The student's name, an empty text when they gave none. */
  name: string;
  /** PL: Klasa ucznia, pusty tekst, gdy jej nie podał. EN: The student's class, an empty text when they gave none. */
  className: string;
};

/** PL: Szczegół zgłoszenia: zgłoszenie, historia i autor (tylko przy zgłoszeniu nieanonimowym). EN: The report detail: the report, the history and the author (only for a signed report). */
export type CouncilDetail = {
  report: CouncilReport;
  history: StageChange[];
  student: CouncilStudent | null;
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
 * PL: Pola zgłoszenia, które wolno oddać panelowi. Jedno miejsce na listę pól, więc nowe pole autora nie trafi tu przez przypadek. Numeru autora tu nie ma, bo czytamy go osobno w `getReport`.
 * EN: The report fields the panel may get. One place for the field list, so a new author field cannot get here by accident. The author id is not here, because we read it separately in `getReport`.
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
 * PL: Czyta imię i klasę autora zgłoszenia. Wołane tylko przy zgłoszeniu nieanonimowym.
 * EN: Reads the name and class of the author of a report. Called only for a signed report.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param authorId - PL: numer autora z zgłoszenia albo `null`. EN: the author id from the report, or `null`.
 * @returns PL: imię i klasa albo `null`, gdy autora nie ma albo nie ma jego profilu. EN: the name and class, or `null` when there is no author or no profile.
 */
async function signedStudent(db: D1Database, authorId: string | null): Promise<CouncilStudent | null> {
  // PL: Bez numeru autora nie ma kogo szukać.
  // EN: Without an author id there is no one to look up.
  if (authorId === null) return null;
  const [found] = await getStudentNames(db, [authorId]);
  return found ? { name: found.name, className: found.className } : null;
}

/**
 * PL: Czyta jedno zgłoszenie razem z historią etapów, od najnowszego etapu. Przy zgłoszeniu nieanonimowym dodaje imię i klasę autora; przy anonimowym nie czyta numeru autora wcale.
 * EN: Reads one report together with its stage history, newest stage first. For a signed report it adds the author's name and class; for an anonymous report it does not read the author id at all.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param id - PL: numer zgłoszenia. EN: the report id.
 * @returns PL: zgłoszenie, historia i autor albo `null`, gdy nie ma takiego zgłoszenia. EN: the report, the history and the author, or `null` when there is no such report.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function getReport(db: D1Database, id: string): Promise<CouncilDetail | null> {
  // PL: Najpierw zgłoszenie z numerem autora; bez zgłoszenia nie ma po co czytać historii.
  // EN: The report first, with the author id; without the report there is no point reading the history.
  const [row] = await drizzle(db).select({ ...COUNCIL_FIELDS, authorId: reports.authorId }).from(reports).where(eq(reports.id, id));
  if (!row) return null;

  // PL: Numer autora zostaje w tej funkcji i nie trafia do wyniku.
  // EN: The author id stays in this function and does not go into the result.
  const { authorId, ...report } = row;
  const student = report.isAnonymous ? null : await signedStudent(db, authorId);

  // PL: Historia: etap i chwila, bez osoby, która go zmieniła.
  // EN: The history: the stage and the moment, without the person who changed it.
  const history = await drizzle(db)
    .select({ stage: reportStageChanges.stage, changedAt: reportStageChanges.changedAt })
    .from(reportStageChanges)
    .where(eq(reportStageChanges.reportId, id))
    .orderBy(desc(reportStageChanges.changedAt));
  return { report, history, student };
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
