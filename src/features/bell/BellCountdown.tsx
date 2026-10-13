/**
 * PL: Licznik do dzwonka: minuty do końca lekcji albo do początku następnej lekcji. Nic nie rysuje, gdy planu nie ma albo nie trwa lekcja ani przerwa. Bez dźwięku, działa offline, liczy na telefonie.
 * EN: Bell countdown: minutes to the end of a lesson or to the start of the next one. Draws nothing when there is no plan or no lesson or break is on. No sound, works offline, counts on the phone.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/bellState.ts::getBellState
 * @uses src/features/bell/bellPlan.ts::BELL_PLAN
 * @used_by src/features/bell/BellScreen.tsx::BellScreen
 */

// PL: Hook React do stanu i efektu odświeżania.
// EN: React hooks for state and the refresh effect.
import { useEffect, useState } from 'react';
// PL: Plan dzwonków, logika licznika i typ lekcji.
// EN: The bell plan, the countdown logic and the lesson type.
import { BELL_PLAN, type Lesson } from './bellPlan';
import { getBellState } from './bellState';
// PL: Style licznika (tylko tokeny z tokens.css).
// EN: The countdown styles (only tokens from tokens.css).
import './bell.css';

// PL: Co ile milisekund odświeżać czas: co sekundę, żeby minuta zmieniała się na czas.
// EN: How often to refresh the time, in milliseconds: every second, so the minute changes on time.
const TICK_MS = 1000;

/**
 * PL: Zwraca bieżącą chwilę i odświeża ją co sekundę. Usuwa licznik czasu przy wyjściu z ekranu.
 * EN: Returns the current moment and refreshes it every second. Clears the timer when the screen is left.
 *
 * @returns PL: bieżąca chwila. EN: the current moment.
 */
function useNow(): Date {
  // PL: Start od bieżącej chwili; potem aktualizacja co TICK_MS.
  // EN: Start from the current moment; then update every TICK_MS.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

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
 * PL: Rysuje licznik do dzwonka. Bez planu (pusta lista) albo poza lekcjami i przerwami zwraca null. W czasie lekcji pokazuje też następną lekcję, a w przerwie, do której lekcji zostało.
 * EN: Draws the bell countdown. With no plan (empty list) or outside lessons and breaks it returns null. During a lesson it also shows the next lesson, and during a break which lesson is coming.
 *
 * @param props - PL: opcjonalny plan lekcji (domyślnie BELL_PLAN). EN: optional lesson plan (BELL_PLAN by default).
 * @returns PL: element licznika albo null. EN: the countdown element or null.
 */
export function BellCountdown({ lessons = BELL_PLAN }: { lessons?: readonly Lesson[] }) {
  // PL: Bieżący stan licznika z bieżącej chwili.
  // EN: The current countdown state from the current moment.
  const now = useNow();
  const state = getBellState(lessons, now);
  if (state === null) return null;
  // PL: Napisy w przerwie i przy następnej lekcji są spoza makiety EKRANY, do potwierdzenia w PR.
  // EN: The texts for the break and for the next lesson are not in the EKRANY mockup, to be confirmed in the PR.
  // PL: Szablon ze stringiem, a nie kilka węzłów JSX, żeby odczyt tekstu z HTML dał jedno zdanie.
  // EN: A template string, not several JSX nodes, so that reading the text from the HTML gives one sentence.
  const label = state.kind === 'lesson' ? 'do dzwonka' : `Przerwa, do lekcji ${state.next.lessonNo}`;
  return (
    <section className="bell-countdown" aria-label="Licznik do dzwonka">
      <p className="bell-countdown__value">
        <span className="bell-countdown__num">{state.minutesLeft}</span>
        <span className="bell-countdown__unit">min</span>
      </p>
      <p className="bell-countdown__label">{label}</p>
      {state.kind === 'lesson' && state.next ? (
        <p className="bell-countdown__next">
          {`Następna: lekcja ${state.next.lessonNo} o ${displayTime(state.next.start)}`}
        </p>
      ) : null}
    </section>
  );
}
