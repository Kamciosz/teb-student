/**
 * PL: Stan dnia dla pulpitu: weekend, brak planu, przed pierwszą lekcją, w trakcie lekcji albo przerwy, po ostatniej lekcji. Plan dnia wybiera tak samo jak licznik (skrócony albo zwykły). Czysta funkcja (bez przeglądarki), więc test może podać dzień i godzinę.
 * EN: The state of the day for the dashboard: weekend, no plan, before the first lesson, during a lesson or break, after the last lesson. The plan of the day is picked the same way as in the countdown (shortened or regular). A pure function (no browser), so a test can give the day and the time.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/bellState.ts::planFor
 * @uses src/features/bell/bellState.ts::bellStateAt
 * @uses src/features/bell/bellState.ts::warsawClock
 * @uses src/features/bell/bellState.ts::parseTime
 * @uses src/features/bell/bellState.ts::LAST_WORKING_DAY
 * @used_by src/features/bell/index.ts::bellDayStatus
 */

// PL: Plan dnia, stan licznika, zegar strefy szkoły i parser godzin z modułu licznika.
// EN: The day's plan, the countdown state, the school zone clock and the time parser from the countdown module.
import { LAST_WORKING_DAY, bellStateAt, parseTime, planFor, warsawClock } from './bellState';

/**
 * PL: Stan dnia: dzień wolny (sobota, niedziela), brak planu, przed pierwszą lekcją, w trakcie lekcji albo przerwy, po ostatniej lekcji.
 * EN: State of the day: a day off (Saturday, Sunday), no plan, before the first lesson, during a lesson or break, after the last lesson.
 */
export type BellDayStatus = 'no-plan' | 'day-off' | 'before' | 'during' | 'after';

/**
 * PL: Stan dnia dla danej chwili. Najpierw weekend (dzień wolny, niezależnie od planu), potem pusty plan, potem położenie w czasie względem lekcji.
 * EN: The state of the day for a given moment. First the weekend (a day off, whatever the plan), then an empty plan, then the position in time relative to the lessons.
 *
 * @param now - PL: chwila w czasie (domyślnie teraz). EN: the moment in time (default: now).
 * @param shortenedDays - PL: dni skrócone w formacie RRRR-MM-DD, czas polski (domyślnie żaden). EN: the shortened days as YYYY-MM-DD, Polish time (none by default).
 * @returns PL: stan dnia. EN: the state of the day.
 */
export function bellDayStatus(now: Date = new Date(), shortenedDays: ReadonlySet<string> = new Set()): BellDayStatus {
  // PL: Zegar w strefie szkoły liczymy raz, dzień tygodnia i godzina idą z jednej chwili.
  // EN: The school zone clock is counted once, so the day of week and the time come from one moment.
  const clock = warsawClock(now);
  // PL: Sobota i niedziela to dzień wolny, nawet gdy plan jest wpisany.
  // EN: Saturday and Sunday are a day off, even when a plan is entered.
  if (clock.weekday > LAST_WORKING_DAY) return 'day-off';
  // PL: Plan dnia: skrócony, gdy dzień jest na liście, inaczej zwykły.
  // EN: The plan of the day: shortened when the day is on the list, otherwise regular.
  const lessons = planFor(now, shortenedDays);
  const first = lessons.at(0);
  // PL: Pusty plan: nie wiemy, kiedy są lekcje, więc nic nie zgadujemy.
  // EN: Empty plan: we do not know when the lessons are, so we guess nothing.
  if (!first) return 'no-plan';
  // PL: Lekcja albo przerwa trwa, gdy licznik ma stan.
  // EN: A lesson or a break is on when the countdown has a state.
  if (bellStateAt(lessons, clock) !== null) return 'during';
  // PL: Poza lekcjami: przed pierwszą (przed jej początkiem) albo po ostatniej.
  // EN: Outside the lessons: before the first one (before its start) or after the last one.
  return clock.secondsOfDay < parseTime(first.start) ? 'before' : 'after';
}
