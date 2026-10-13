/**
 * PL: Logika licznika do dzwonka. Z czasu warszawskiego i planu lekcji wylicza, czy trwa lekcja, czy przerwa, i ile minut zostało. Wybiera plan dnia: zwykły albo skrócony (dni skrócone podaje pulpit i ekran dzwonka). Czysta funkcja (bez przeglądarki), więc test może podać dzień i godzinę.
 * EN: Logic of the bell countdown. From Warsaw time and the lesson plan it works out whether a lesson or a break is on, and how many minutes are left. It picks the plan of the day: regular or shortened (the shortened days come from the dashboard and the bell screen). A pure function (no browser), so a test can give the day and the time.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/bellPlan.ts::BELL_PLAN
 * @uses src/features/bell/bellPlan.ts::SHORTENED_BELL_PLAN
 * @uses src/features/bell/bellPlan.ts::Lesson
 * @used_by src/features/bell/BellCountdown.tsx::BellCountdown
 * @used_by src/features/bell/index.ts::currentBellState
 * @used_by src/features/bell/index.ts::hasBellPlan
 * @used_by src/features/bell/BellScreen.tsx::BellScreen
 */

// PL: Typ lekcji z planu.
// EN: The lesson type from the plan.
import { BELL_PLAN, SHORTENED_BELL_PLAN, type Lesson } from './bellPlan';

// PL: Strefa czasu szkoły. Telefon może być w innej strefie, więc czas liczymy zawsze stąd.
// EN: The school's time zone. The phone may be in another zone, so time is always counted from here.
const SCHOOL_TIME_ZONE = 'Europe/Warsaw';

// PL: Ostatni dzień roboczy (1 = poniedziałek ... 5 = piątek). Dni 6 i 7 to weekend.
// EN: Last working day (1 = Monday ... 5 = Friday). Days 6 and 7 are the weekend.
const LAST_WORKING_DAY = 5;

// PL: Formatowanie czasu w strefie szkoły. Godzina 0–23 (hourCycle h23), bez AM/PM.
// EN: Time formatting in the school zone. Hour 0–23 (hourCycle h23), no AM/PM.
const clockFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: SCHOOL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/**
 * PL: Następna lekcja: numer (od 1) i godzina początku z planu (HH:MM).
 * EN: The next lesson: number (from 1) and its start time from the plan (HH:MM).
 */
export type NextLesson = { lessonNo: number; start: string };

/**
 * PL: Stan licznika: trwa lekcja (z numerem od 1) albo przerwa. Oba stany znają następną lekcję; w czasie ostatniej lekcji dnia następnej nie ma (null). Brak stanu (null) znaczy, że licznika nie pokazujemy.
 * EN: Countdown state: a lesson (numbered from 1) or a break. Both states know the next lesson; during the last lesson of the day there is no next one (null). No state (null) means the countdown is not shown.
 */
export type BellState =
  | { kind: 'lesson'; lessonNo: number; minutesLeft: number; next: NextLesson | null }
  | { kind: 'break'; minutesLeft: number; next: NextLesson };

/**
 * PL: Zegar w strefie szkoły: dzień tygodnia (1 = poniedziałek ... 7 = niedziela) i sekundy od północy.
 * EN: Clock in the school zone: day of week (1 = Monday ... 7 = Sunday) and seconds since midnight.
 */
export type WarsawClock = { weekday: number; secondsOfDay: number };

/**
 * PL: Dzień w strefie szkoły w formacie RRRR-MM-DD. Po nim sprawdzamy, czy dzień jest skrócony.
 * EN: The day in the school zone as YYYY-MM-DD. It is used to check whether the day is shortened.
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @returns PL: dzień RRRR-MM-DD. EN: the day as YYYY-MM-DD.
 */
export function warsawDate(now: Date): string {
  // PL: Rozbij wynik Intl na części po nazwie, tak jak w zegarze.
  // EN: Split the Intl result into parts by name, as in the clock.
  const parts = Object.fromEntries(clockFormat.formatToParts(now).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * PL: Zamienia godzinę, minutę i sekundę na sekundy od północy.
 * EN: Converts hour, minute and second into seconds since midnight.
 *
 * @param hour - PL: godzina 0–23. EN: hour 0–23.
 * @param minute - PL: minuta. EN: minute.
 * @param second - PL: sekunda. EN: second.
 * @returns PL: sekundy od północy. EN: seconds since midnight.
 */
function toSeconds(hour: number, minute: number, second: number): number {
  // PL: 60 sekund w minucie, 3600 w godzinie.
  // EN: 60 seconds in a minute, 3600 in an hour.
  return hour * 3600 + minute * 60 + second;
}

/**
 * PL: Odczytuje z chwili dzień tygodnia i godzinę w strefie szkoły. Zmianę czasu letniego i zimowego liczy Intl.
 * EN: Reads the day of week and the time in the school zone from a moment. Intl works out the summer and winter change.
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @returns PL: zegar w strefie szkoły. EN: the clock in the school zone.
 */
export function warsawClock(now: Date): WarsawClock {
  // PL: Rozbij wynik Intl na części po nazwie (year, month, ...), nie po pozycji.
  // EN: Split the Intl result into parts by name (year, month, ...), not by position.
  const parts = Object.fromEntries(clockFormat.formatToParts(now).map((part) => [part.type, part.value]));
  // PL: Dzień tygodnia liczymy z daty bez godziny w UTC, żeby strefa komputera nie przesuwała dnia.
  // EN: The day of week is counted from the date without the hour in UTC, so the computer's zone does not shift the day.
  const utcDay = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day))).getUTCDay();
  return {
    weekday: utcDay === 0 ? 7 : utcDay,
    // PL: Godzina % 24 zamienia ewentualne „24” (niektóre przeglądarki tak zwracają o północy) na 0.
    // EN: Hour % 24 turns a possible "24" (some browsers return it at midnight) into 0.
    secondsOfDay: toSeconds(Number(parts.hour) % 24, Number(parts.minute), Number(parts.second)),
  };
}

/**
 * PL: Zamienia godzinę z planu (HH:MM) na sekundy od północy.
 * EN: Converts a plan time (HH:MM) into seconds since midnight.
 *
 * @param time - PL: godzina w formacie HH:MM. EN: time in HH:MM format.
 * @returns PL: sekundy od północy. EN: seconds since midnight.
 */
function parseTime(time: string): number {
  // PL: Rozbij „HH:MM” na godzinę i minutę.
  // EN: Split "HH:MM" into hour and minute.
  const [hour, minute] = time.split(':').map(Number);
  return toSeconds(hour, minute, 0);
}

/**
 * PL: Zaokrągla w górę sekundy do pełnych minut, więc 29 min 10 s pokazuje się jako 30.
 * EN: Rounds seconds up to whole minutes, so 29 min 10 s shows as 30.
 *
 * @param seconds - PL: pozostałe sekundy. EN: seconds left.
 * @returns PL: pozostałe minuty. EN: minutes left.
 */
function minutesCeil(seconds: number): number {
  // PL: 60 sekund w minucie.
  // EN: 60 seconds in a minute.
  return Math.ceil(seconds / 60);
}

/**
 * PL: Wylicza następną lekcję po lekcji o podanym indeksie. Po ostatniej lekcji dnia następnej nie ma.
 * EN: Works out the lesson after the one at the given index. After the last lesson of the day there is none.
 *
 * @param lessons - PL: plan lekcji. EN: the lesson plan.
 * @param index - PL: indeks bieżącej lekcji (od 0). EN: index of the current lesson (from 0).
 * @returns PL: następna lekcja albo null. EN: the next lesson or null.
 */
function nextLessonAfter(lessons: readonly Lesson[], index: number): NextLesson | null {
  // PL: Numer lekcji to indeks + 1, więc następna ma indeks + 2.
  // EN: The lesson number is the index + 1, so the next one is index + 2.
  const next = lessons.at(index + 1);
  return next ? { lessonNo: index + 2, start: next.start } : null;
}

/**
 * PL: Wylicza stan licznika dla danego zegara. Lekcja trwa od początku (włącznie) do końca (wyłącznie). Przerwa to czas między końcem lekcji a początkiem następnej. Przed pierwszą i po ostatniej lekcji oraz w weekend stanu nie ma.
 * EN: Works out the countdown state for a given clock. A lesson runs from its start (inclusive) to its end (exclusive). A break is the time between the end of a lesson and the start of the next one. Before the first lesson, after the last one, and at the weekend there is no state.
 *
 * @param lessons - PL: plan lekcji, posortowany rosnąco. EN: the lesson plan, sorted ascending.
 * @param clock - PL: zegar w strefie szkoły. EN: the clock in the school zone.
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
export function bellStateAt(lessons: readonly Lesson[], clock: WarsawClock): BellState | null {
  // PL: Poza dniami roboczymi licznika nie ma.
  // EN: Outside working days there is no countdown.
  if (clock.weekday > LAST_WORKING_DAY) return null;
  for (const [index, lesson] of lessons.entries()) {
    // PL: Początek i koniec bieżącej lekcji w sekundach od północy.
    // EN: Start and end of the current lesson in seconds since midnight.
    const start = parseTime(lesson.start);
    const end = parseTime(lesson.end);
    const next = nextLessonAfter(lessons, index);
    if (clock.secondsOfDay >= start && clock.secondsOfDay < end) {
      return { kind: 'lesson', lessonNo: index + 1, minutesLeft: minutesCeil(end - clock.secondsOfDay), next };
    }
    // PL: Przerwa to czas po końcu tej lekcji, przed początkiem następnej. Po ostatniej lekcji nie ma następnej, więc nic się nie pokazuje.
    // EN: A break is the time after the end of this lesson and before the start of the next one. After the last lesson there is no next one, so nothing shows.
    if (next && clock.secondsOfDay >= end && clock.secondsOfDay < parseTime(next.start)) {
      return { kind: 'break', minutesLeft: minutesCeil(parseTime(next.start) - clock.secondsOfDay), next };
    }
  }
  return null;
}

/**
 * PL: Wylicza stan licznika dla danej chwili: najpierw zegar w strefie szkoły, potem stan z planu.
 * EN: Works out the countdown state for a given moment: first the clock in the school zone, then the state from the plan.
 *
 * @param lessons - PL: plan lekcji. EN: the lesson plan.
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
export function getBellState(lessons: readonly Lesson[], now: Date): BellState | null {
  return bellStateAt(lessons, warsawClock(now));
}

/**
 * PL: Wybiera plan dnia danej chwili: skrócony, gdy dzień jest na liście dni skróconych, inaczej zwykły.
 * EN: Picks the plan of the day of a given moment: the shortened one when the day is on the list of shortened days, otherwise the regular one.
 *
 * @param now - PL: chwila w czasie. EN: the moment in time.
 * @param shortenedDays - PL: dni skrócone w formacie RRRR-MM-DD, czas polski. EN: the shortened days as YYYY-MM-DD, Polish time.
 * @returns PL: plan dnia. EN: the plan of the day.
 */
function planFor(now: Date, shortenedDays: ReadonlySet<string>): readonly Lesson[] {
  // PL: Dzień tej chwili w strefie szkoły decyduje o planie.
  // EN: The day of this moment in the school zone decides the plan.
  return shortenedDays.has(warsawDate(now)) ? SHORTENED_BELL_PLAN : BELL_PLAN;
}

/**
 * PL: Wylicza stan licznika dla danej chwili: wybiera plan dnia (skrócony, gdy dzień jest na liście dni skróconych, inaczej zwykły) i z niego stan. Zwraca null, gdy planu nie ma (pusty plan) albo nie trwa lekcja ani przerwa.
 * EN: Works out the countdown state for a given moment: picks the plan of the day (the shortened one when the day is on the list of shortened days, otherwise the regular one) and the state from it. Returns null when there is no plan (empty plan) or no lesson or break is on.
 *
 * @param now - PL: chwila w czasie (domyślnie teraz). EN: the moment in time (default: now).
 * @param shortenedDays - PL: dni skrócone w formacie RRRR-MM-DD, czas polski (domyślnie żaden). EN: the shortened days as YYYY-MM-DD, Polish time (none by default).
 * @returns PL: stan licznika albo null. EN: the countdown state or null.
 */
export function currentBellState(now: Date = new Date(), shortenedDays: ReadonlySet<string> = new Set()): BellState | null {
  return getBellState(planFor(now, shortenedDays), now);
}

/**
 * PL: Czy plan dnia danej chwili ma choć jedną lekcję. Plan wybiera tak samo jak currentBellState. Nie sprawdza weekendu: to robi stan licznika, a tu pytamy tylko, czy plan jest wpisany. Dzięki temu pulpit odróżni „brak planu” od „po lekcjach”.
 * EN: Whether the plan of a given moment's day has at least one lesson. The plan is picked the same way as in currentBellState. It does not check the weekend: the countdown state does that, and here we only ask whether the plan is filled in. This lets the dashboard tell "no plan" from "after lessons".
 *
 * @param now - PL: chwila w czasie (domyślnie teraz). EN: the moment in time (default: now).
 * @param shortenedDays - PL: dni skrócone w formacie RRRR-MM-DD, czas polski (domyślnie żaden). EN: the shortened days as YYYY-MM-DD, Polish time (none by default).
 * @returns PL: true, gdy plan dnia ma lekcje. EN: true when the plan of the day has lessons.
 */
export function hasBellPlan(now: Date = new Date(), shortenedDays: ReadonlySet<string> = new Set()): boolean {
  return planFor(now, shortenedDays).length > 0;
}
