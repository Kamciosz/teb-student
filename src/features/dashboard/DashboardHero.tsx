/**
 * PL: Góra pulpitu: licznik do dzwonka z następną lekcją i duży blok „Ważne” z najnowszym wpisem. Licznik prowadzi do ekranu /bell. Gdy stanu nie ma (null), zamiast liczby stoi jeden wiersz tekstu, zależny od stanu dnia: bez planu „Brak planu dzwonków”, w dzień wolny „Dziś nie ma lekcji”, przed lekcjami „Lekcje jeszcze się nie zaczęły”, w trakcie „Trwa lekcja”, po lekcjach „Po lekcjach”. Blok „Ważne” znika, gdy wpisu nie ma.
 * EN: The top of the dashboard: the bell countdown with the next lesson and a large "Ważne" block with the newest entry. The countdown leads to the /bell screen. When there is no state (null), instead of a number one line of text stands, depending on the day's state: "Brak planu dzwonków" without a plan, "Dziś nie ma lekcji" on a day off, "Lekcje jeszcze się nie zaczęły" before the lessons, "Trwa lekcja" during them, "Po lekcjach" after them. The "Ważne" block disappears when there is no entry.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/format.ts::formatAge
 * @uses src/features/dashboard/useBellState.ts::useBellState
 * @uses src/features/dashboard/types.ts::ImportantEntry
 * @uses src/features/bell/index.ts::nextLessonLabel
 * @uses src/features/bell/index.ts::BellState
 * @uses src/features/bell/index.ts::BellDayStatus
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 */

// PL: Link do ekranu licznika i do wpisu bez przeładowania strony.
// EN: A link to the countdown screen and to the entry without reloading the page.
import { Link } from 'react-router';
// PL: Typy stanu z drzwi modułu bell oraz napis o następnej lekcji.
// EN: The state types from the bell module door and the next lesson text.
import { nextLessonLabel, type BellDayStatus, type BellState } from '../bell';
// PL: Wiek wpisu i stan licznika, odświeżany, gdy karta jest widoczna.
// EN: The entry age and the countdown state, refreshed while the tab is visible.
import { formatAge } from './format';
import { useBellState } from './useBellState';
// PL: Typ wpisu „Ważne”.
// EN: The "Ważne" entry type.
import type { ImportantEntry } from './types';

// PL: Napis zamiast liczby, gdy licznika nie ma, dla każdego stanu dnia (pełne zestawienie, żeby nowy stan nie zginął po cichu).
// EN: The text instead of the number when there is no countdown, for each day state (the full list, so that a new state cannot be lost silently).
const NO_STATE_TEXT: Record<BellDayStatus, string> = {
  // PL: Brak planu: plan dzwonków jest pusty, więc nie wiemy, kiedy są lekcje, i niczego nie zgadujemy.
  // EN: No plan: the bell plan is empty, so we do not know when the lessons are, and we guess nothing.
  'no-plan': 'Brak planu dzwonków',
  'day-off': 'Dziś nie ma lekcji',
  before: 'Lekcje jeszcze się nie zaczęły',
  during: 'Trwa lekcja',
  after: 'Po lekcjach',
};

/**
 * PL: Rysuje treść licznika: minuty i opis albo, bez stanu, jeden wiersz tekstu zależny od stanu dnia.
 * EN: Draws the content of the countdown: the minutes and the caption, or, without a state, one line of text that depends on the day's state.
 *
 * @param props - PL: stan licznika albo null oraz stan dnia. EN: the countdown state or null, and the day state.
 * @returns PL: elementy licznika. EN: the countdown elements.
 */
export function BellReadout({ state, day }: { state: BellState | null; day: BellDayStatus }) {
  // PL: Bez stanu tylko jeden wiersz tekstu, bez dużej liczby.
  // EN: Without a state only one line of text, no big number.
  if (state === null) return <p className="dash-hero__line">{NO_STATE_TEXT[day]}</p>;
  // PL: Liczba minut w dużym rozmiarze (najwyżej --t-num), potem podpis i, w lekcji, następna lekcja.
  // EN: The number of minutes in a large size (at most --t-num), then the caption and, during a lesson, the next lesson.
  const caption = state.kind === 'lesson' ? 'do dzwonka' : `Przerwa, do lekcji ${state.next.lessonNo}`;
  return (
    <>
      <p className="dash-hero__countdown">
        <span className="dash-hero__num">{state.minutesLeft}</span>
        <span className="dash-hero__unit">min</span>
      </p>
      <p className="dash-hero__caption">{caption}</p>
      {state.kind === 'lesson' && state.next ? <p className="dash-hero__caption">{nextLessonLabel(state.next)}</p> : null}
    </>
  );
}

/** PL: Własności góry pulpitu. EN: The properties of the dashboard top. */
export type DashboardHeroProps = {
  /** PL: Najnowszy wpis „Ważne” albo null. EN: The newest "Ważne" entry, or null. */
  important: ImportantEntry | null;
};

/**
 * PL: Rysuje górę pulpitu: licznik do dzwonka i, gdy jest, blok „Ważne”.
 * EN: Draws the top of the dashboard: the bell countdown and, when there is one, the "Ważne" block.
 *
 * @param props - PL: wpis „Ważne” do pokazania. EN: the "Ważne" entry to show.
 * @returns PL: sekcja z licznikiem i blokiem. EN: the section with the countdown and the block.
 */
export function DashboardHero({ important }: DashboardHeroProps) {
  const { state, day } = useBellState();
  return (
    <section className="dash-hero" aria-label="Teraz">
      {/* PL: Licznik do dzwonka jako link do /bell. EN: The bell countdown as a link to /bell. */}
      <Link to="/bell" className="dash-hero__bell" aria-label="Licznik do dzwonka">
        <BellReadout state={state} day={day} />
      </Link>
      {/* PL: Blok „Ważne” jest osobnym linkiem, bo link w linku byłby błędem. EN: The "Ważne" block is a separate link, because a link inside a link would be an error. */}
      {important === null ? null : (
        <Link to={`/news/feed/${encodeURIComponent(important.id)}`} className="dash-hero__important">
          <span className="dash-hero__kicker">
            <span>{important.source === '' ? 'Ważne' : `Ważne · ${important.source}`}</span>
            <span>{formatAge(important.publishedAt)}</span>
          </span>
          <span className="dash-hero__title">{important.title}</span>
          {important.excerpt === '' ? null : <span className="dash-hero__excerpt">{important.excerpt}</span>}
        </Link>
      )}
    </section>
  );
}
