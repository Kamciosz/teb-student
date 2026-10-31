/**
 * PL: Dostęp do bazy dla zgłoszeń w panelu: lista, szczegół z historią i zmiana etapu. Tylko ten plik pisze zapytania SQL podtoru 4b. Numer autora czytamy tylko przy zgłoszeniu nieanonimowym, żeby oddać imię i klasę z modułu profilu. Sam numer nigdy nie wychodzi z tego pliku, a przy anonimowym nie czytamy go wcale.
 * EN: Database access for reports in the panel: the list, the detail with its history and the stage change. Only this file writes the SQL queries of subtrack 4b. We read the author id only for a signed report, to return the name and class from the profile module. The id itself never leaves this file, and for an anonymous report we do not read it at all.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportStageChanges
 * @uses worker/db/schema/reports.ts::reportJoins
 * @uses worker/db/schema/admin.ts::diaryEntries
 * @uses worker/profile/index.ts::getStudentNames
 * @used_by worker/reports/admin/routes.ts::listReports
 * @used_by worker/reports/admin/routes.ts::getReport
 * @used_by worker/reports/admin/routes.ts::changeReportStage
 */

// PL: count liczy wiersze, desc sortuje malejąco, eq porównuje wartości w warunku WHERE.
// EN: count counts rows, desc sorts in descending order, eq compares values in a WHERE condition.
import { and, count, desc, eq, ne, sql } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele i typy modułu (schemat należy do podtoru 4a, tu tylko czytamy).
// EN: The module tables and types (the schema belongs to subtrack 4a, here we only read it).
import { reportJoins, reports, reportStageChanges, type ReportCategory, type ReportPlace, type ReportStage } from '../../db/schema/reports';
// PL: Tabela dziennika i typ akcji. Wpis w dzienniku idzie w tym samym batchu co zmiana etapu.
// EN: The diary table and the action type. The diary entry goes into the same batch as the stage change.
import { diaryEntries, type DiaryAction } from '../../db/schema/admin';
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
  /** PL: Numer zdjęcia z modułu mediów albo `null`, gdy zdjęcia nie ma. EN: The photo id from the media module, or `null` when there is no photo. */
  photoId: string | null;
  /** PL: Bieżący etap. EN: The current stage. */
  stage: ReportStage;
  /** PL: Chwila wysłania, milisekundy od 1970. EN: When the report was sent, milliseconds since 1970. */
  createdAt: number;
  /** PL: Chwila ostatniej zmiany etapu, milisekundy od 1970. EN: When the stage last changed, milliseconds since 1970. */
  updatedAt: number;
  /** PL: Ile osób dołączyło („Mnie też”). Sama liczba, bez numerów osób. EN: How many people joined ("Me too"). Only the number, no person ids. */
  joinCount: number;
};

/** PL: Imię i klasa autora zgłoszenia nieanonimowego. EN: The name and class of the author of a signed report. */
export type CouncilStudent = {
  /** PL: Imię ucznia, pusty tekst, gdy go nie podał. EN: The student's name, an empty text when they gave none. */
  name: string;
  /** PL: Klasa ucznia, pusty tekst, gdy jej nie podał. EN: The student's class, an empty text when they gave none. */
  className: string;
};

/** PL: Szczegół zgłoszenia: zgłoszenie, historia z odpowiedziami dla autora i autor (tylko przy zgłoszeniu nieanonimowym). EN: The report detail: the report, the history with the answers for the author, and the author (only for a signed report). */
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
  /** PL: Odpowiedź dla autora zapisana przy tej zmianie, albo `null`, gdy jej nie było. EN: The answer for the author saved with this change, or `null` when there was none. */
  note: string | null;
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
  photoId: reports.photoId,
  stage: reports.stage,
  createdAt: reports.createdAt,
  updatedAt: reports.updatedAt,
  // PL: Liczba wierszy dołączeń; `count(userId)` nie liczy pustego złączenia, więc zgłoszenie bez dołączeń ma 0. Numer osoby nigdy nie jest wybierany.
  // EN: The number of join rows; `count(userId)` does not count an empty join, so a report without joins has 0. The person's id is never selected.
  joinCount: count(reportJoins.userId),
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
  return drizzle(db)
    .select(COUNCIL_FIELDS)
    .from(reports)
    .leftJoin(reportJoins, eq(reportJoins.reportId, reports.id))
    .groupBy(reports.id)
    .orderBy(desc(reports.createdAt));
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
  const [row] = await drizzle(db)
    .select({ ...COUNCIL_FIELDS, authorId: reports.authorId })
    .from(reports)
    .leftJoin(reportJoins, eq(reportJoins.reportId, reports.id))
    .where(eq(reports.id, id))
    .groupBy(reports.id);
  if (!row) return null;

  // PL: Numer autora zostaje w tej funkcji i nie trafia do wyniku.
  // EN: The author id stays in this function and does not go into the result.
  const { authorId, ...report } = row;
  const student = report.isAnonymous ? null : await signedStudent(db, authorId);

  // PL: Historia: etap, chwila i odpowiedź dla autora, bez osoby, która go zmieniła.
  // EN: The history: the stage, the moment and the answer for the author, without the person who changed it.
  const history = await drizzle(db)
    .select({ stage: reportStageChanges.stage, changedAt: reportStageChanges.changedAt, note: reportStageChanges.note })
    .from(reportStageChanges)
    .where(eq(reportStageChanges.reportId, id))
    .orderBy(desc(reportStageChanges.changedAt));
  return { report, history, student };
}

/**
 * PL: Zmienia etap zgłoszenia. Wpis w dzienniku, etap, czas zmiany i nowy wiersz historii (z odpowiedzią dla autora, jeśli jest) idą w jednym `batch`, więc albo są wszystkie, albo żaden. Wpis w dzienniku powstaje tylko wtedy, gdy etap rzeczywiście się zmienia, i zapisuje się przed zmianą, więc sprawdza etap sprzed zmiany. Ten sam etap nie zmienia nic i nie dopisuje historii, więc też nie zapisuje odpowiedzi.
 * EN: Changes a report's stage. The diary entry, the stage, the change time and the new history row (with the answer for the author, if any) go in one `batch`, so either all exist or none. The diary entry is written only when the stage really changes, and it goes before the change, so it checks the stage from before the change. The same stage changes nothing and adds no history, so it does not save the answer either.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param change - PL: numer zgłoszenia, nowy etap, odpowiedź dla autora (albo `null`) i numer osoby z Samorządu. EN: the report id, the new stage, the answer for the author (or `null`) and the Student Council member's id.
 * @returns PL: `not_found`, `unchanged` albo `changed`. EN: `not_found`, `unchanged` or `changed`.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the write fails.
 */
export async function changeReportStage(db: D1Database, change: { id: string; stage: ReportStage; note: string | null; memberId: string }): Promise<StageChangeResult> {
  // PL: Sprawdź, czy zgłoszenie istnieje i czy etap w ogóle się zmienia.
  // EN: Check that the report exists and that the stage really changes.
  const [current] = await drizzle(db).select({ stage: reports.stage }).from(reports).where(eq(reports.id, change.id));
  if (!current) return 'not_found';
  if (current.stage === change.stage) return 'unchanged';

  // PL: Zapisz wpis w dzienniku, etap i wiersz historii razem. Wpis w dzienniku zapisuje się pierwszy i tylko wtedy, gdy zgłoszenie nadal ma inny etap, więc widzi stan sprzed zmiany.
  // EN: Save the diary entry, the stage and the history row together. The diary entry is saved first and only when the report still has a different stage, so it sees the state from before the change.
  const orm = drizzle(db);
  const now = Date.now();
  await orm.batch([
    orm.insert(diaryEntries).select(
      orm
        .select({
          id: sql<number | null>`null`.as('id'),
          actorId: sql<string>`${change.memberId}`.as('actor_id'),
          action: sql<DiaryAction>`'report_stage_changed'`.as('action'),
          targetId: reports.id,
          at: sql<number>`${now}`.as('at'),
        })
        .from(reports)
        .where(and(eq(reports.id, change.id), ne(reports.stage, change.stage))),
    ),
    orm.update(reports).set({ stage: change.stage, updatedAt: now }).where(eq(reports.id, change.id)),
    orm.insert(reportStageChanges).values({ id: crypto.randomUUID(), reportId: change.id, stage: change.stage, note: change.note, changedBy: change.memberId, changedAt: now }),
  ]);
  return 'changed';
}
