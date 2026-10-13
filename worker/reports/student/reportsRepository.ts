/**
 * PL: Dostęp do bazy dla zgłoszeń ucznia: zapis nowego zgłoszenia z pierwszym etapem w historii i odczyt zgłoszeń jednego autora wraz z historią etapów i odpowiedziami Samorządu. Tylko ten plik pisze zapytania SQL modułu 4a, żeby trasy zostały krótkie.
 * EN: Database access for student reports: saving a new report with its first stage in the history, and reading one author's reports with their stage history and Student Council answers. Only this file writes the SQL queries of module 4a, so the routes stay short.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportStageChanges
 * @uses worker/db/schema/reports.ts::MAX_STAGE_NOTE_LENGTH
 * @used_by worker/reports/student/routes.ts::createReport
 * @used_by worker/reports/student/routes.ts::listReportsByAuthor
 */

// PL: desc i asc sortują malejąco i rosnąco, eq i inArray porównują wartości w warunku WHERE.
// EN: desc and asc sort in descending and ascending order, eq and inArray compare values in a WHERE condition.
import { asc, desc, eq, inArray } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele i typy modułu.
// EN: The module tables and types.
import { reports, reportStageChanges, type ReportCategory, type ReportPlace, type ReportStage } from '../../db/schema/reports';
// PL: Oczyszczone dane zgłoszenia.
// EN: The cleaned report data.
import type { ReportInput } from './validation';

/**
 * PL: Zgłoszenie w takiej postaci, w jakiej wraca do telefonu ucznia. Celowo nie ma tu numeru autora, znacznika anonimowości ani numeru członka Samorządu, który zmienił etap.
 * EN: A report in the form that goes back to the student's phone. There is deliberately no author id, no anonymity flag and no id of the Student Council member who changed the stage.
 */
export type MyReport = {
  /** PL: Numer zgłoszenia. EN: The report id. */
  id: string;
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
  /** PL: Historia etapów od pierwszego, rosnąco po czasie. EN: The stage history from the first stage, ascending by time. */
  history: MyReportHistoryEntry[];
};

/**
 * PL: Jeden wpis historii widoczny dla ucznia: etap, chwila i odpowiedź Samorządu. Bez numeru członka, który zmienił etap.
 * EN: One history entry visible to the student: the stage, the time and the Student Council answer. Without the id of the member who changed the stage.
 */
export type MyReportHistoryEntry = {
  /** PL: Etap, na który przeszło zgłoszenie. EN: The stage the report moved to. */
  stage: ReportStage;
  /** PL: Krótka odpowiedź Samorządu (do 500 znaków) albo `null`. EN: The short Student Council answer (up to 500 characters) or `null`. */
  note: string | null;
  /** PL: Chwila zmiany etapu, milisekundy od 1970. EN: When the stage changed, milliseconds since 1970. */
  changedAt: number;
};

/**
 * PL: Zapisuje nowe zgłoszenie na etapie „przyjęte” razem z pierwszym wierszem historii. Oba zapisy idą w jednym `batch`, więc albo są oba, albo żaden.
 * EN: Saves a new report at the "received" stage together with the first history row. Both writes go in one `batch`, so either both exist or neither does.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param authorId - PL: numer ucznia, który wysyła zgłoszenie. EN: the id of the student sending the report.
 * @param input - PL: sprawdzone dane zgłoszenia. EN: the validated report data.
 * @returns PL: numer nowego zgłoszenia. EN: the id of the new report.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the write fails.
 */
export async function createReport(db: D1Database, authorId: string, input: ReportInput): Promise<string> {
  // PL: Numer zgłoszenia i chwila wysłania.
  // EN: The report id and the sending time.
  const id = crypto.randomUUID();
  const now = Date.now();

  // PL: Zapisz zgłoszenie i pierwszy etap historii razem.
  // EN: Save the report and the first history stage together.
  await drizzle(db).batch([
    drizzle(db).insert(reports).values({ id, authorId, ...input, stage: 'received', createdAt: now, updatedAt: now }),
    drizzle(db).insert(reportStageChanges).values({ id: crypto.randomUUID(), reportId: id, stage: 'received', changedBy: null, changedAt: now }),
  ]);

  // PL: Oddaj numer, żeby telefon wiedział, co zapisano.
  // EN: Return the id, so the phone knows what was saved.
  return id;
}

/**
 * PL: Czyta zgłoszenia jednego autora, od najnowszego, razem z ich historią etapów. Nigdy nie zwraca cudzych zgłoszeń ani numeru autora czy członka Samorządu.
 * EN: Reads one author's reports, newest first, together with their stage history. Never returns other people's reports or the id of the author or of the Student Council member.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param authorId - PL: numer ucznia, którego zgłoszenia czytamy. EN: the id of the student whose reports we read.
 * @returns PL: lista zgłoszeń tego ucznia. EN: the list of this student's reports.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function listReportsByAuthor(db: D1Database, authorId: string): Promise<MyReport[]> {
  // PL: Wybierz tylko pola, które wolno oddać uczniowi, i tylko wiersze tego autora.
  // EN: Select only the fields the student may get, and only this author's rows.
  const rows = await drizzle(db)
    .select({
      id: reports.id,
      category: reports.category,
      place: reports.place,
      placeDetail: reports.placeDetail,
      description: reports.description,
      stage: reports.stage,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
    })
    .from(reports)
    .where(eq(reports.authorId, authorId))
    .orderBy(desc(reports.createdAt));

  // PL: Bez zgłoszeń nie ma historii do czytania, więc kończymy od razu.
  // EN: With no reports there is no history to read, so we finish right away.
  if (rows.length === 0) return [];

  // PL: Jedno zapytanie po wszystkich zgłoszeniach naraz: wpisy od najstarszego, bez numeru członka Samorządu.
  // EN: One query for all these reports at once: entries from the oldest, without the Student Council member's id.
  const history = await drizzle(db)
    .select({
      reportId: reportStageChanges.reportId,
      stage: reportStageChanges.stage,
      note: reportStageChanges.note,
      changedAt: reportStageChanges.changedAt,
    })
    .from(reportStageChanges)
    .where(inArray(reportStageChanges.reportId, rows.map((row) => row.id)))
    .orderBy(asc(reportStageChanges.changedAt));

  // PL: Dołącz do każdego zgłoszenia jego wpisy historii.
  // EN: Attach each report's history entries to it.
  return rows.map((row) => ({
    ...row,
    history: history
      .filter((entry) => entry.reportId === row.id)
      .map(({ stage, note, changedAt }) => ({ stage, note, changedAt })),
  }));
}
