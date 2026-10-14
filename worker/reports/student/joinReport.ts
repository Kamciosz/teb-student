/**
 * PL: Dołączenie ucznia do zgłoszenia („Mnie też”). Jeden głos na ucznia i zgłoszenie: powtórne kliknięcie niczego nie zmienia. Nie wolno dołączyć do własnego zgłoszenia ani do załatwionego.
 * EN: A student joins a report ("Me too"). One vote per student and report: clicking again changes nothing. A student may not join their own report or a resolved one.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/db/schema/reports.ts::reports
 * @uses worker/db/schema/reports.ts::reportJoins
 * @used_by worker/reports/student/routes.ts::joinReport
 * @used_by worker/reports/student/joinReport.test.ts::joinReport
 */

// PL: Warunki WHERE i zliczanie wierszy z Drizzle.
// EN: WHERE conditions and row counting from Drizzle.
import { count, eq } from 'drizzle-orm';
// PL: Drizzle dla bazy D1.
// EN: Drizzle for the D1 database.
import { drizzle } from 'drizzle-orm/d1';
// PL: Tabele modułu.
// EN: The module tables.
import { reportJoins, reports } from '../../db/schema/reports';

/**
 * PL: Wynik dołączenia: liczba dołączeń po zmianie albo powód odmowy (`not_found` gdy zgłoszenia nie ma lub jest załatwione, `own_report` gdy to zgłoszenie ucznia).
 * EN: The join result: the number of joins after the change, or the reason for refusal (`not_found` when the report does not exist or is resolved, `own_report` when it is the student's own report).
 */
export type JoinResult = { ok: true; joinCount: number } | { ok: false; reason: 'not_found' | 'own_report' };

/**
 * PL: Dołącza ucznia do otwartego zgłoszenia cudzego. Powtórne dołączenie zostawia jeden wiersz.
 * EN: Joins the student to someone else's open report. A repeated join keeps one row.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param studentId - PL: numer ucznia, który dołącza (z sesji). EN: the id of the student who joins (from the session).
 * @param reportId - PL: numer zgłoszenia z adresu. EN: the report id from the address.
 * @returns PL: wynik dołączenia z liczbą dołączeń albo powód odmowy. EN: the join result with the number of joins, or the reason for refusal.
 * @throws PL: błąd bazy, gdy zapis się nie uda. EN: a database error when the write fails.
 */
export async function joinReport(db: D1Database, studentId: string, reportId: string): Promise<JoinResult> {
  const orm = drizzle(db);

  // PL: Zgłoszenie musi istnieć i nie może być załatwione.
  // EN: The report must exist and must not be resolved.
  const [report] = await orm.select({ authorId: reports.authorId, stage: reports.stage }).from(reports).where(eq(reports.id, reportId)).limit(1);
  if (!report || report.stage === 'resolved') return { ok: false, reason: 'not_found' };

  // PL: Do własnego zgłoszenia nie dołączamy.
  // EN: We do not join your own report.
  if (report.authorId === studentId) return { ok: false, reason: 'own_report' };

  // PL: Wpisz dołączenie; jeśli już jest, zostaw je bez zmian (jeden głos na ucznia).
  // EN: Insert the join; if it already exists, leave it unchanged (one vote per student).
  await orm.insert(reportJoins).values({ reportId, userId: studentId, createdAt: Date.now() }).onConflictDoNothing();

  // PL: Policz dołączenia po zmianie, żeby telefon pokazał aktualny licznik.
  // EN: Count the joins after the change, so the phone shows the current counter.
  const [counted] = await orm.select({ joinCount: count() }).from(reportJoins).where(eq(reportJoins.reportId, reportId));
  return { ok: true, joinCount: counted?.joinCount ?? 0 };
}
