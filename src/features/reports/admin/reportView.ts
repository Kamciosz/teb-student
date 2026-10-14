/**
 * PL: Czyste funkcje widoku panelu zgłoszeń: filtr po etapie, kolejność listy, nazwa etapu, krótka data, tekst miejsca i liczba osób („Mnie też”). Bez Reacta, żeby dało się je sprawdzić testem.
 * EN: Pure functions of the reports panel view: the stage filter, the list order, the stage name, the short date, the place text and the number of people ("Me too"). No React, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/reportLabels.ts::STAGES
 * @uses src/features/reports/admin/reportLabels.ts::ReportOrder
 * @used_by src/features/reports/admin/ReportsList.tsx::filterByStage
 * @used_by src/features/reports/admin/ReportsList.tsx::sortReports
 * @used_by src/features/reports/admin/ReportDetail.tsx::formatShortDate
 * @used_by src/features/reports/admin/reportView.test.ts::filterByStage
 * @used_by src/features/reports/admin/reportView.test.ts::sortReports
 */

import type { AdminReport } from './api';
import { ALL_STAGES, CATEGORY_LABELS, PLACE_LABELS, STAGES, type ReportOrder } from './reportLabels';

/** PL: Strefa czasowa szkoły. Data ma być taka sama na każdym telefonie. EN: The school time zone. A date must be the same on every phone. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/** PL: Reguły liczby mnogiej dla polskiego (jedna, dwie–cztery, reszta). EN: The plural rules for Polish (one, two to four, the rest). */
const polishPlural = new Intl.PluralRules('pl-PL');

/** PL: Słowo „osoba” w odmianie: dla kategorii `one` i `few`; reszta to „osób”. Tekst do uzgodnienia z zespołem. EN: The word "person" in its forms: for the `one` and `few` categories; the rest is "osób". The text is to be agreed with the team. */
const PERSON_WORDS: Record<string, string> = { one: 'osoba', few: 'osoby' };

/**
 * PL: Zostawia zgłoszenia z wybranego etapu. Filtr „Wszystkie” zostawia wszystkie.
 * EN: Keeps the reports of the chosen stage. The "Wszystkie" filter keeps them all.
 *
 * @param reports - PL: lista zgłoszeń. EN: the list of reports.
 * @param filter - PL: kod etapu albo `all`. EN: a stage code or `all`.
 * @returns PL: zgłoszenia z tego etapu, w tej samej kolejności. EN: the reports of that stage, in the same order.
 */
export function filterByStage(reports: readonly AdminReport[], filter: string): AdminReport[] {
  // PL: „Wszystkie” oddaje kopię listy, etap zostawia pasujące zgłoszenia.
  // EN: "Wszystkie" returns a copy of the list, a stage keeps the matching reports.
  return filter === ALL_STAGES ? [...reports] : reports.filter((report) => report.stage === filter);
}

/**
 * PL: Układa zgłoszenia w wybranej kolejności. „Najnowsze” to od najnowszego; „Najwięcej osób” to od największej liczby dołączeń, a przy remisie nowsze wyżej. Brak liczby dołączeń liczy się jak zero. Oddaje nową tablicę, wejścia nie rusza.
 * EN: Orders the reports in the chosen order. "Najnowsze" is newest first; "Najwięcej osób" is the most joins first, and on a tie the newer one comes first. A missing join count counts as zero. Returns a new array and does not touch the input.
 *
 * @param reports - PL: lista zgłoszeń. EN: the list of reports.
 * @param order - PL: wybrana kolejność. EN: the chosen order.
 * @returns PL: nowa, posortowana lista. EN: a new, sorted list.
 */
export function sortReports(reports: readonly AdminReport[], order: ReportOrder): AdminReport[] {
  // PL: Kopia listy, żeby sortowanie nie zmieniło listy z zapisu w telefonie.
  // EN: A copy of the list, so the sort does not change the list from the phone copy.
  const sorted = [...reports];
  if (order === 'most_joined') {
    // PL: Najpierw liczba dołączeń malejąco, przy takiej samej liczbie nowsze zgłoszenie wyżej.
    // EN: First the join count descending, and with the same count the newer report first.
    return sorted.sort((a, b) => (b.joinCount ?? 0) - (a.joinCount ?? 0) || b.createdAt - a.createdAt);
  }
  // PL: Od najnowszego po dacie utworzenia, nie po kolejności z serwera.
  // EN: Newest first by the creation date, not by the server order.
  return sorted.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * PL: Podaje nazwę etapu.
 * EN: Gives the stage name.
 *
 * @param code - PL: kod etapu z serwera. EN: the stage code from the server.
 * @returns PL: polska nazwa albo sam kod, gdy serwer wyśle nieznany. EN: the Polish name, or the code itself when the server sends an unknown one.
 */
export function stageLabel(code: string): string {
  // PL: Nieznany kod z serwera nie psuje ekranu.
  // EN: An unknown code from the server does not break the screen.
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
  // PL: Nieznany kod z serwera nie psuje ekranu.
  // EN: An unknown code from the server does not break the screen.
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
  // PL: Puste dokładne miejsce (`null` albo pusty tekst) ustępuje rodzajowi miejsca.
  // EN: An empty exact place (`null` or an empty text) gives way to the kind of place.
  return report.placeDetail || (PLACE_LABELS[report.place] ?? report.place);
}

/**
 * PL: Podaje liczbę osób, które dołączyły („Mnie też”), np. „+3 osoby”. Bez danych (zapis z telefonu sprzed tej zmiany) albo przy zerze nie ma czego pokazać, więc zwraca `null`.
 * EN: Gives the number of people who joined ("Me too"), for example "+3 osoby". Without data (a phone copy from before this change) or with zero there is nothing to show, so it returns `null`.
 *
 * @param count - PL: liczba dołączeń albo `undefined`, gdy serwer jej nie wysłał. EN: the number of joins, or `undefined` when the server did not send it.
 * @returns PL: tekst z odmianą albo `null`. EN: the text with the right form, or `null`.
 */
export function joinText(count: number | undefined): string | null {
  // PL: Brak danych albo zero: nie pokazujemy nic.
  // EN: No data or zero: we show nothing.
  if (count === undefined || count <= 0) return null;
  // PL: Odmiana wg reguł polskich: 1 → „osoba”, 2–4 (poza 12–14) → „osoby”, reszta → „osób”.
  // EN: The form by the Polish rules: 1 → "osoba", 2–4 (except 12–14) → "osoby", the rest → "osób".
  const word = PERSON_WORDS[polishPlural.select(count)] ?? 'osób';
  return `+${count} ${word}`;
}

/**
 * PL: Zamienia chwilę na krótką datę „dzień.miesiąc”, na przykład „6.10”, w czasie szkoły.
 * EN: Turns a moment into a short "day.month" date, for example "6.10", in school time.
 *
 * @param milliseconds - PL: chwila w milisekundach od 1970. EN: the moment in milliseconds since 1970.
 * @returns PL: data bez zer wiodących. EN: the date without leading zeros.
 */
export function formatShortDate(milliseconds: number): string {
  // PL: Rozbij datę na części w czasie szkoły i złóż ją bez zer wiodących.
  // EN: Split the date into parts in school time and assemble it without leading zeros.
  const parts = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'numeric', timeZone: SCHOOL_TIME_ZONE }).formatToParts(milliseconds);
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day}.${month}`;
}
