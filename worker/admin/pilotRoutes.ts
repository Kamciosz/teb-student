/**
 * PL: Router pliku z danymi z pilotażu (podtor 8, ekran 6.1e): GET /pilot daje plik CSV z trzema liczbami (ile osób się zalogowało, ile zgłoszeń wpłynęło, ile odpowiedzi dały ankiety). Nie ma w nim imion, nazwisk ani adresów, a ankiety są tylko policzone. Tylko administrator.
 * EN: The router of the pilot data file (subtrack 8, screen 6.1e): GET /pilot gives a CSV file with three numbers (how many people signed in, how many reports came in, how many survey answers were given). It has no names, surnames or addresses, and surveys are only counted. Administrator only.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/auth/index.ts::countStudents
 * @uses worker/reports/index.ts::countReports
 * @uses worker/surveys/index.ts::countSurveyParticipations
 * @uses worker/admin/requirePanelRole.ts::requirePanelRole
 * @used_by worker/admin/routes.ts::adminApp
 * @used_by worker/admin/pilot.test.ts::pilotApp
 */

// PL: Hono to router serwera.
// EN: Hono is the server router.
import { Hono } from 'hono';
// PL: Liczby z drzwi modułów: auth (konta), zgłoszenia i ankiety. Każdy moduł daje tylko liczbę.
// EN: The numbers from the module doors: auth (accounts), reports and surveys. Each module gives only a number.
import { countStudents } from '../auth';
import { countReports } from '../reports';
import { countSurveyParticipations } from '../surveys';
// PL: Sprawdzanie roli administratora i typ środowiska z rolą.
// EN: The administrator role check and the environment type with the role.
import { requirePanelRole, type PanelEnv } from './requirePanelRole';

/**
 * PL: Znak kolejności bajtów UTF-8 na początku pliku. Dzięki niemu arkusz kalkulacyjny czyta polskie litery poprawnie.
 * EN: The UTF-8 byte order mark at the start of the file. It lets spreadsheet programs read Polish letters correctly.
 */
const BYTE_ORDER_MARK = '﻿';

/**
 * PL: Składa treść pliku CSV: nagłówek i po jednym wierszu na każdą liczbę. Etykiety są stałe i nie zawierają przecinków.
 * EN: Builds the CSV content: a header and one row for each number. The labels are fixed and contain no commas.
 *
 * @param counts - PL: pary etykieta i liczba, w kolejności pliku. EN: pairs of label and number, in the order of the file.
 * @returns PL: treść pliku. EN: the file content.
 */
function buildPilotCsv(counts: [string, number][]): string {
  // PL: Pierwszy wiersz to nagłówek, potem jeden wiersz na liczbę. Wiersze kończą się CRLF, jak w Excelu.
  // EN: The first row is the header, then one row per number. The rows end with CRLF, as in Excel.
  const rows = [['Wskaźnik', 'Liczba'], ...counts.map(([label, count]) => [label, String(count)])];
  return BYTE_ORDER_MARK + rows.map((row) => row.join(',')).join('\r\n') + '\r\n';
}

/**
 * PL: Router pliku pilotażu: tylko administrator. Oddaje plik do pobrania.
 * EN: The pilot file router: administrator only. It returns the file to download.
 */
export const pilotApp = new Hono<PanelEnv>().use(requirePanelRole('admin')).get('/', async (context) => {
  // PL: Policz trzy liczby w bazie.
  // EN: Count the three numbers in the database.
  const counts: [string, number][] = [
    ['Ile osób się zalogowało', await countStudents(context.env.DB)],
    ['Ile zgłoszeń wpłynęło', await countReports(context.env.DB)],
    ['Ile odpowiedzi dały ankiety', await countSurveyParticipations(context.env.DB)],
  ];
  // PL: Oddaj plik jako załącznik do pobrania.
  // EN: Return the file as a download attachment.
  return context.body(buildPilotCsv(counts), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': 'attachment; filename="pilotaz.csv"',
  });
});
