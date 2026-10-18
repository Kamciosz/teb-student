/**
 * PL: Napis o następnej lekcji, na przykład „Następna: lekcja 3 o 9:50”. Używa go licznik na ekranie dzwonka i górny rząd pulpitu, więc tekst jest jeden.
 * EN: The text about the next lesson, for example "Następna: lekcja 3 o 9:50". The countdown on the bell screen and the dashboard top row use it, so the text is one.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/bell/bellState.ts::NextLesson
 * @used_by src/features/bell/BellCountdown.tsx::BellCountdown
 * @used_by src/features/dashboard/DashboardHero.tsx::BellReadout
 */

// PL: Typ następnej lekcji z planu.
// EN: The type of the next lesson from the plan.
import type { NextLesson } from './bellState';

/**
 * PL: Godzina z planu do pokazania na ekranie. Bez zera z przodu, jak w makiecie („9:50”, „10:45”).
 * EN: A plan time to show on the screen. Without a leading zero, as in the mockup ("9:50", "10:45").
 *
 * @param start - PL: godzina w formacie HH:MM. EN: time in HH:MM format.
 * @returns PL: godzina bez zera z przodu. EN: the time without a leading zero.
 */
function displayTime(start: string): string {
  // PL: Usuwamy tylko zero na samym początku, „10:45” zostaje bez zmian.
  // EN: Only the zero at the very start is removed, "10:45" stays as it is.
  return start.replace(/^0/, '');
}

/**
 * PL: Zwraca napis o następnej lekcji z numerem i godziną startu.
 * EN: Returns the text about the next lesson with its number and start time.
 *
 * @param next - PL: następna lekcja. EN: the next lesson.
 * @returns PL: napis „Następna: lekcja N o H:MM”. EN: the "Następna: lekcja N o H:MM" text.
 */
export function nextLessonLabel(next: NextLesson): string {
  return `Następna: lekcja ${next.lessonNo} o ${displayTime(next.start)}`;
}
