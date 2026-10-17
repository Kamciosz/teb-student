/**
 * PL: Plan dzwonków podtoru 6 (licznik do dzwonka). To jedyne miejsce z godzinami lekcji. Plan wpisany wg planu szkoły z 14.10.2026. Lekcje są numerowane od 0 (lekcja 0 to 07:10–07:55).
 * EN: The bell plan of subtrack 6 (bell countdown). This is the only place with lesson times. The plan is filled in from the school's plan of 14.10.2026. Lessons are numbered from 0 (lesson 0 is 07:10–07:55).
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @used_by src/features/bell/BellScreen.tsx::BellScreen
 */

// PL: Jedna lekcja: godzina początku i końca w formacie HH:MM, czas warszawski.
// EN: One lesson: start and end time in HH:MM format, Warsaw time.
export type Lesson = { start: string; end: string };

// PL: Plan lekcji tak samo dla każdego dnia roboczego (poniedziałek–piątek). Lista ma być posortowana rosnąco i bez nakładania się. Przerwy nie trzeba wpisywać: to odstępy między lekcjami. Format, nie dane: { start: '08:00', end: '08:45' }.
// EN: The lesson plan, the same for every working day (Monday–Friday). The list must be sorted ascending and must not overlap. Breaks need no entry: they are the gaps between lessons. Format, not data: { start: '08:00', end: '08:45' }.
export const BELL_PLAN: readonly Lesson[] = [
  { start: '07:10', end: '07:55' },
  { start: '08:00', end: '08:45' },
  { start: '08:50', end: '09:35' },
  { start: '09:45', end: '10:30' },
  { start: '10:40', end: '11:25' },
  { start: '11:35', end: '12:20' },
  { start: '12:35', end: '13:20' },
  { start: '13:25', end: '14:10' },
  { start: '14:15', end: '15:00' },
  { start: '15:05', end: '15:50' },
  { start: '15:55', end: '16:40' },
  { start: '16:45', end: '17:30' },
  { start: '17:35', end: '18:20' },
];
