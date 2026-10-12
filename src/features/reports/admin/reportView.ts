/**
 * PL: Czyste funkcje widoku panelu zgłoszeń: filtr po etapie, nazwa etapu, krótka data i tekst miejsca. Bez Reacta, żeby dało się je sprawdzić testem.
 * EN: Pure functions of the reports panel view: the stage filter, the stage name, the short date and the place text. No React, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/reportLabels.ts::STAGES
 * @used_by src/features/reports/admin/ReportsList.tsx::filterByStage
 * @used_by src/features/reports/admin/ReportDetail.tsx::formatShortDate
 * @used_by src/features/reports/admin/reportView.test.ts::filterByStage
 */

import type { AdminReport } from './api';
import { ALL_STAGES, CATEGORY_LABELS, PLACE_LABELS, STAGES } from './reportLabels';

/** PL: Strefa czasowa szkoły. Data ma być taka sama na każdym telefonie. EN: The school time zone. A date must be the same on every phone. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/**
 * PL: Zostawia zgłoszenia z wybranego etapu. Filtr „Wszystkie” zostawia wszystkie.
 * EN: Keeps the reports of the chosen stage. The "Wszystkie" filter keeps them all.
 *
 * @param reports - PL: lista zgłoszeń. EN: the list of reports.
 * @param filter - PL: kod etapu albo `all`. EN: a stage code or `all`.
 * @returns PL: zgłoszenia z tego etapu, w tej samej kolejności. EN: the reports of that stage, in the same order.
 */
export function filterByStage(reports: readonly AdminReport[], filter: string): AdminReport[] {
  return filter === ALL_STAGES ? [...reports] : reports.filter((report) => report.stage === filter);
}

/**
 * PL: Podaje nazwę etapu.
 * EN: Gives the stage name.
 *
 * @param code - PL: kod etapu z serwera. EN: the stage code from the server.
 * @returns PL: polska nazwa albo sam kod, gdy serwer wyśle nieznany. EN: the Polish name, or the code itself when the server sends an unknown one.
 */
export function stageLabel(code: string): string {
  return STAGES.find((stage) => stage.code === code)?.label ?? code;
}

/**
 * PL: Podaje nazwę kategorii do znacznika.
 * EN: Gives the category name for the tag.
 *
 * @param code - PL: kod kategorii z serwera. EN: the category code from the server.
 * @returns PL: polska nazwa albo sam kod. EN: the Polish name, or the code itself.
 */
export function categoryLabel(code: string): string {
  return CATEGORY_LABELS[code] ?? code;
}

/**
 * PL: Podaje miejsce zgłoszenia: dokładne miejsce wpisane przez ucznia, a gdy go nie ma, rodzaj miejsca (ekran 6.4a).
 * EN: Gives the report place: the exact place typed by the student, and when there is none, the kind of place (screen 6.4a).
 *
 * @param report - PL: zgłoszenie. EN: the report.
 * @returns PL: tekst miejsca. EN: the place text.
 */
export function placeText(report: Pick<AdminReport, 'place' | 'placeDetail'>): string {
  return report.placeDetail || (PLACE_LABELS[report.place] ?? report.place);
}

/**
 * PL: Zamienia chwilę na krótką datę „dzień.miesiąc”, na przykład „6.10”, w czasie szkoły.
 * EN: Turns a moment into a short "day.month" date, for example "6.10", in school time.
 *
 * @param milliseconds - PL: chwila w milisekundach od 1970. EN: the moment in milliseconds since 1970.
 * @returns PL: data bez zer wiodących. EN: the date without leading zeros.
 */
export function formatShortDate(milliseconds: number): string {
  const parts = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'numeric', timeZone: SCHOOL_TIME_ZONE }).formatToParts(milliseconds);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day}.${month}`;
}
