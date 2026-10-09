/**
 * PL: Czyste funkcje widoku „Moje zgłoszenia”: które segmenty paska etapu świecą i jak pokazać krótką datę. Bez Reacta, żeby dało się je sprawdzić testem.
 * EN: Pure functions of the "Moje zgłoszenia" view: which segments of the stage bar light up and how to show a short date. No React, so a test can check them.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/reports/student/reportOptions.ts::STAGE_ORDER
 * @used_by src/features/reports/student/MyReports.tsx::stageSegments
 * @used_by src/features/reports/student/MyReports.tsx::formatShortDate
 * @used_by src/features/reports/student/reportView.test.ts::stageSegments
 */

// PL: Kolejność etapów.
// EN: The stage order.
import { STAGE_ORDER } from './reportOptions';

/** PL: Strefa czasowa szkoły. Data zgłoszenia ma być taka sama w całym kraju i na każdym telefonie. EN: The school time zone. A report date must be the same everywhere and on every phone. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/**
 * PL: Mówi, które z trzech segmentów paska etapu są zapalone (ekran 3.5).
 * EN: Tells which of the three stage bar segments are lit (screen 3.5).
 *
 * @param stage - PL: kod bieżącego etapu. EN: the code of the current stage.
 * @returns PL: trzy wartości; segment świeci, gdy etap jest osiągnięty. Nieznany etap zapala tylko pierwszy segment. EN: three values; a segment is lit when its stage is reached. An unknown stage lights only the first segment.
 */
export function stageSegments(stage: string): boolean[] {
  // PL: Numer etapu na liście; nieznany kod traktujemy jak „przyjęte”.
  // EN: The stage position in the list; an unknown code counts as "received".
  const index = Math.max(0, STAGE_ORDER.findIndex((item) => item.code === stage));
  // PL: Segment świeci, gdy jego numer nie przekracza numeru etapu.
  // EN: A segment is lit when its position does not exceed the stage position.
  return STAGE_ORDER.map((_item, position) => position <= index);
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
