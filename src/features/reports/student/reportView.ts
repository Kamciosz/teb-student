/**
 * PL: Czyste funkcje widoku zgłoszeń ucznia: nazwa etapu i krótka data. Bez Reacta, żeby dało się je sprawdzić testem.
 * EN: Pure functions of the student reports view: the stage name and a short date. No React, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportOptions.ts::STAGE_ORDER
 * @used_by src/features/reports/student/MyReports.tsx::stageLabel
 * @used_by src/features/reports/student/MyReports.tsx::formatShortDate
 * @used_by src/features/reports/student/ReportDetails.tsx::stageLabel
 * @used_by src/features/reports/student/ReportDetails.tsx::formatShortDate
 * @used_by src/features/reports/student/SimilarReports.tsx::stageLabel
 * @used_by src/features/reports/student/reportView.test.ts::stageLabel
 * @used_by src/features/reports/student/reportView.test.ts::formatShortDate
 */

// PL: Kolejność etapów.
// EN: The stage order.
import { STAGE_ORDER } from './reportOptions';

/** PL: Strefa czasowa szkoły. Data zgłoszenia ma być taka sama w całym kraju i na każdym telefonie. EN: The school time zone. A report date must be the same everywhere and on every phone. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/**
 * PL: Podaje nazwę etapu do pokazania uczniowi (na przykład „W trakcie”). Nieznany kod wraca bez zmian.
 * EN: Gives the stage name to show the student (for example "W trakcie"). An unknown code comes back unchanged.
 *
 * @param stage - PL: kod etapu z serwera. EN: the stage code from the server.
 * @returns PL: nazwa etapu albo sam kod, gdy nie ma go na liście. EN: the stage name, or the code itself when it is not on the list.
 */
export function stageLabel(stage: string): string {
  // PL: Szukamy etapu na liście; brak wyniku oznacza nieznany kod.
  // EN: Look the stage up in the list; no result means an unknown code.
  return STAGE_ORDER.find((item) => item.code === stage)?.label ?? stage;
}

/**
 * PL: Zamienia chwilę na krótką datę „dzień.miesiąc”, na przykład „6.10”, w czasie szkoły.
 * EN: Turns a moment into a short "day.month" date, for example "6.10", in school time.
 *
 * @param milliseconds - PL: chwila w milisekundach od 1970. EN: the moment in milliseconds since 1970.
 * @returns PL: data bez zer wiodących. EN: the date without leading zeros.
 */
export function formatShortDate(milliseconds: number): string {
  // PL: Rozbierz datę na części, żeby nie zależeć od zapisu w lokalizacji telefonu.
  // EN: Split the date into parts, so we do not depend on the phone locale's format.
  const parts = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'numeric', timeZone: SCHOOL_TIME_ZONE }).formatToParts(milliseconds);
  // PL: Weź dzień i miesiąc z części.
  // EN: Take the day and the month from the parts.
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day}.${month}`;
}
