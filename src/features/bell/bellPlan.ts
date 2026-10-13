/**
 * PL: Plan dzwonków podtoru 6 (licznik do dzwonka). To jedyne miejsce z godzinami lekcji. Uzupełnia go Kacper (termin: 17.10). Dopóki lista jest pusta, licznik się nie pokazuje. Planu nie zgadujemy.
 * EN: The bell plan of subtrack 6 (bell countdown). This is the only place with lesson times. Kacper fills it in (deadline: 17.10). While the list is empty, the countdown does not show. We do not guess the plan.
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
export const BELL_PLAN: readonly Lesson[] = [];

// PL: Plan skrócony, który Samorząd włącza na wybrany dzień (lekcje skrócone). Pusty, bo godziny poda szkoła. TO_AGREE: godziny planu skróconego uzgadniamy ze szkołą; dopóki są puste, dzień skrócony nie pokazuje licznika.
// EN: The shortened plan the Student Council turns on for a chosen day (shortened lessons). Empty, because the school will provide the hours. TO_AGREE: the shortened plan hours are agreed with the school; while they are empty, a shortened day shows no countdown.
export const SHORTENED_BELL_PLAN: readonly Lesson[] = [];
