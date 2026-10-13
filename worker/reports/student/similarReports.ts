/**
 * PL: Lista otwartych zgłoszeń podobnych do nowego (ta sama kategoria i to samo miejsce), żeby uczeń mógł dołączyć zamiast tworzyć duplikat („Mnie też”). Pokazuje tylko liczbę dołączeń i to, czy uczeń już dołączył; nie pokazuje, kto dołączył, ani numeru autora.
 * EN: The list of open reports similar to a new one (the same category and the same place), so a student can join instead of creating a duplicate ("Me too"). It shows only the number of joins and whether the student already joined; it does not show who joined, nor the author id.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportJoins
 * @used_by worker/reports/student/routes.ts::listSimilarReports
 * @used_by worker/reports/student/similarReports.test.ts::listSimilarReports
 */

// PL: Warunki WHERE, łączenie tabel i sortowanie z Drizzle.
// EN: WHERE conditions, table joins and sorting from Drizzle.
import { and, count, desc, eq, isNull, ne, or, sql } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele i typy modułu.
// EN: The module tables and types.
import { reportJoins, reports, type ReportCategory, type ReportPlace, type ReportStage } from '../../db/schema/reports';

/** PL: Najwyżej tyle podobnych zgłoszeń pokazujemy, żeby lista mieściła się na ekranie. EN: At most this many similar reports are shown, so the list fits the screen. */
const SIMILAR_LIMIT = 5;

/**
 * PL: Kryteria szukania podobnych zgłoszeń: kategoria i miejsce, już sprawdzone kody.
 * EN: The criteria for finding similar reports: the category and the place, already checked codes.
 */
export type SimilarQuery = {
  /** PL: Kategoria nowego zgłoszenia. EN: The category of the new report. */
  category: ReportCategory;
  /** PL: Miejsce nowego zgłoszenia. EN: The place of the new report. */
  place: ReportPlace;
};

/**
 * PL: Podobne zgłoszenie w takiej postaci, w jakiej wraca do telefonu. Bez numeru autora i bez listy osób, które dołączyły.
 * EN: A similar report in the form that goes back to the phone. Without the author id and without the list of people who joined.
 */
export type SimilarReport = {
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
  /** PL: Bieżący etap (tu zawsze „przyjęte” albo „w trakcie”). EN: The current stage (here always "received" or "in_progress"). */
  stage: ReportStage;
  /** PL: Chwila wysłania, milisekundy od 1970. EN: When the report was sent, milliseconds since 1970. */
  createdAt: number;
  /** PL: Ile uczniów dołączyło („Mnie też”). EN: How many students joined ("Me too"). */
  joinCount: number;
  /** PL: Czy uczeń, który pyta, już dołączył. EN: Whether the student asking has already joined. */
  joinedByMe: boolean;
};

/**
 * PL: Szuka otwartych zgłoszeń o tej samej kategorii i miejscu. Pomija zgłoszenia ucznia, który pyta (dołączać do własnego nie ma sensu), ale zostawia zgłoszenia bez autora po usunięciu konta. Zamknięte („załatwione”) pomija.
 * EN: Finds open reports with the same category and place. Skips the asking student's own reports (joining your own makes no sense), but keeps reports without an author after an account deletion. Skips closed ("resolved") ones.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param studentId - PL: numer ucznia, który pyta. EN: the id of the student asking.
 * @param query - PL: kategoria i miejsce nowego zgłoszenia. EN: the category and place of the new report.
 * @returns PL: najwyżej pięć zgłoszeń, najbardziej poparte najpierw, potem najnowsze. EN: at most five reports, the most supported first, then the newest.
 * @throws PL: błąd bazy, gdy odczyt się nie uda. EN: a database error when the read fails.
 */
export async function listSimilarReports(db: D1Database, studentId: string, query: SimilarQuery): Promise<SimilarReport[]> {
  // PL: Liczba dołączeń i to, czy wśród nich jest uczeń, który pyta (0 albo 1).
  // EN: The number of joins and whether the asking student is among them (0 or 1).
  const joinCount = count(reportJoins.userId);
  const joinedByMe = sql<number>`coalesce(max(${reportJoins.userId} = ${studentId}), 0)`;

  // PL: Zgłoszenia otwarte, tej samej kategorii i miejsca, nie własne; bez autora zostają.
  // EN: Open reports of the same category and place, not the student's own; the ones without an author stay.
  const rows = await drizzle(db)
    .select({
      id: reports.id,
      category: reports.category,
      place: reports.place,
      placeDetail: reports.placeDetail,
      description: reports.description,
      stage: reports.stage,
      createdAt: reports.createdAt,
      joinCount,
      joinedByMe,
    })
    .from(reports)
    .leftJoin(reportJoins, eq(reportJoins.reportId, reports.id))
    .where(
      and(
        eq(reports.category, query.category),
        eq(reports.place, query.place),
        ne(reports.stage, 'resolved'),
        or(isNull(reports.authorId), ne(reports.authorId, studentId)),
      ),
    )
    .groupBy(reports.id)
    .orderBy(desc(joinCount), desc(reports.createdAt))
    .limit(SIMILAR_LIMIT);

  // PL: SQLite zwraca flagę jako liczbę, więc zamieniamy ją na prawdę albo fałsz.
  // EN: SQLite returns the flag as a number, so we turn it into true or false.
  return rows.map((row) => ({ ...row, joinedByMe: row.joinedByMe === 1 }));
}
