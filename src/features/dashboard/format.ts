/**
 * PL: Formatowanie tekstów pulpitu: data u góry, wiek wpisu, krótka data wiersza i słowo „dni”. Czas liczymy w strefie szkoły, żeby nie zależał od ustawień telefonu.
 * EN: Formatting of the dashboard texts: the date at the top, the entry age, the short date of a row and the word "dni". We count time in the school time zone, so it does not depend on the phone settings.
 *
 * @author Kacper
 * @since 2026-10-11
 * @used_by src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 * @used_by src/features/dashboard/DashboardTiles.tsx::ImportantTile
 */

/** PL: Strefa szkoły. EN: The school time zone. */
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

/** PL: Długości w milisekundach. EN: Lengths in milliseconds. */
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * PL: Składa dzień i miesiąc w postaci „6.10” albo „29.09”: dzień bez zera z przodu, miesiąc zawsze z dwóch cyfr (tak jak w docs/projekt/EKRANY.md i w module ankiet). Zero dopisujemy sami, bo przeglądarki różnie formatują miesiąc.
 * EN: Joins the day and month as "6.10" or "29.09": the day without a leading zero, the month always two digits (as in docs/projekt/EKRANY.md and in the surveys module). We add the zero ourselves, because browsers format the month differently.
 *
 * @param moment - PL: chwila do opisania. EN: the moment to describe.
 * @returns PL: tekst „dzień.miesiąc”. EN: the "day.month" text.
 */
function dayAndMonth(moment: Date): string {
  // PL: Rozbij datę na części w strefie szkoły i weź dzień oraz miesiąc.
  // EN: Split the date into parts in the school time zone and take the day and month.
  const parts = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'numeric', timeZone: SCHOOL_TIME_ZONE }).formatToParts(moment);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${Number(pick('day'))}.${pick('month').padStart(2, '0')}`;
}

/**
 * PL: Data nad powitaniem, na przykład „Wtorek, 6.10” (docs/projekt/EKRANY.md, ekran 2.1).
 * EN: The date above the greeting, for example "Wtorek, 6.10" (docs/projekt/EKRANY.md, screen 2.1).
 *
 * @param now - PL: bieżąca chwila. EN: the current moment.
 * @returns PL: dzień tygodnia wielką literą, przecinek i data. EN: the weekday with a capital letter, a comma and the date.
 */
export function formatToday(now: Date): string {
  // PL: Dzień tygodnia po polsku, wielką literą.
  // EN: The weekday in Polish, with a capital letter.
  const weekday = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', timeZone: SCHOOL_TIME_ZONE }).format(now);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayAndMonth(now)}`;
}

/**
 * PL: Krótka data wiersza ogłoszenia, na przykład „12.10”.
 * EN: The short date of an announcement row, for example "12.10".
 *
 * @param iso - PL: chwila publikacji, tekst ISO 8601. EN: the publication moment, an ISO 8601 text.
 * @returns PL: tekst „dzień.miesiąc”. EN: the "day.month" text.
 */
export function formatShortDate(iso: string): string {
  return dayAndMonth(new Date(iso));
}

/**
 * PL: Wiek wpisu przy etykiecie kafla „Ważne”, na przykład „20 min” (docs/projekt/EKRANY.md, ekran 2.1). Starszy niż tydzień wpis ma krótką datę.
 * EN: The entry age next to the "Ważne" tile label, for example "20 min" (docs/projekt/EKRANY.md, screen 2.1). An entry older than a week gets the short date.
 *
 * @param iso - PL: chwila publikacji, tekst ISO 8601. EN: the publication moment, an ISO 8601 text.
 * @param now - PL: bieżąca chwila w milisekundach (domyślnie z zegara telefonu). EN: the current moment in milliseconds (by default from the phone clock).
 * @returns PL: krótki opis wieku. EN: a short age description.
 */
export function formatAge(iso: string, now: number = Date.now()): string {
  // PL: Ile czasu minęło. Wpis „z przyszłości” (zegar telefonu się spóźnia) liczymy jak świeży.
  // EN: How much time has passed. An entry "from the future" (the phone clock is late) counts as fresh.
  const elapsed = Math.max(0, now - new Date(iso).getTime());
  if (elapsed < MINUTE) return 'teraz';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} godz.`;
  if (elapsed < 2 * DAY) return 'wczoraj';
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} dni`;
  return formatShortDate(iso);
}

/**
 * PL: Podpis pod liczbą dni kafla „Ankieta”: „dzień do końca” dla jedynki, w pozostałych przypadkach „dni do końca” (jak w module ankiet).
 * EN: The caption under the day count of the "Ankieta" tile: "dzień do końca" for one, "dni do końca" otherwise (as in the surveys module).
 *
 * @param days - PL: dni do końca ankiety. EN: days left until the survey ends.
 * @returns PL: podpis. EN: the caption.
 */
export function daysLeftLabel(days: number): string {
  return `${days === 1 ? 'dzień' : 'dni'} do końca`;
}
