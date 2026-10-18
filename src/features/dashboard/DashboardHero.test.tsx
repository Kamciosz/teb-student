/**
 * PL: Testy góry pulpitu: licznik pokazuje minuty, gdy stan jest, z następną lekcją lub przerwą. Bez stanu zostaje jeden wiersz tekstu zależny od stanu dnia: „Brak planu dzwonków”, „Dziś nie ma lekcji”, „Lekcje jeszcze się nie zaczęły”, „Trwa lekcja” albo „Po lekcjach”. Blok „Ważne” pojawia się, gdy jest wpis, i prowadzi do wpisu. Stan dzwonka i stan dnia są podstawione, a czas udawany.
 * EN: Tests of the dashboard top: the countdown shows minutes when there is a state, with the next lesson or the break. Without a state one line of text stays, depending on the day's state: "Brak planu dzwonków", "Dziś nie ma lekcji", "Lekcje jeszcze się nie zaczęły", "Trwa lekcja" or "Po lekcjach". The "Ważne" block appears when there is an entry and leads to the entry. The bell state and the day state are substituted and the time is faked.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/DashboardHero.tsx::DashboardHero
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i podstawianie odczytów modułu.
// EN: Vitest test functions and substitution of the module reads.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymaga Link.
// EN: Rendering to text and the router that Link needs.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowana część i odczyty modułu bell (podstawione poniżej).
// EN: The tested part and the bell module reads (substituted below).
import { DashboardHero } from './DashboardHero';
import { bellDayStatus, currentBellState } from '../bell';
import type { BellDayStatus, BellState } from '../bell';
// PL: Typ wpisu „Ważne”.
// EN: The "Ważne" entry type.
import type { ImportantEntry } from './types';

// PL: Podstawiamy tylko odczyty stanu, bo plan w main jest pusty. Napis o następnej lekcji zostaje prawdziwy.
// EN: We substitute only the state reads, because the plan in main is empty. The next lesson text stays real.
vi.mock('../bell', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../bell')>()),
  currentBellState: vi.fn(() => null),
  bellDayStatus: vi.fn((): BellDayStatus => 'no-plan'),
}));

// PL: Przykładowe stany: trwa lekcja z następną, trwa lekcja bez następnej i przerwa.
// EN: Sample states: a lesson with a next one, a lesson without a next one, and a break.
const LESSON: BellState = { kind: 'lesson', lessonNo: 2, minutesLeft: 12, next: { lessonNo: 3, start: '09:50' } };
const BREAK: BellState = { kind: 'break', minutesLeft: 5, next: { lessonNo: 3, start: '09:50' } };

// PL: Przykładowy wpis „Ważne”.
// EN: A sample "Ważne" entry.
const IMPORTANT: ImportantEntry = {
  id: 'n-7',
  title: 'Zebranie rodziców',
  excerpt: 'We wtorek o 17:00 w auli.',
  source: 'Sekretariat',
  publishedAt: '2026-10-23T07:00:00Z',
};

/**
 * PL: Renderuje górę pulpitu w routerze.
 * EN: Renders the dashboard top inside a router.
 *
 * @param important - PL: wpis „Ważne” albo null. EN: the "Ważne" entry or null.
 * @returns PL: HTML góry. EN: the HTML of the top.
 */
function renderHero(important: ImportantEntry | null = null): string {
  return renderToString(
    <MemoryRouter>
      <DashboardHero important={important} />
    </MemoryRouter>,
  );
}

describe('DashboardHero: licznik do dzwonka', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(currentBellState).mockReset();
    vi.mocked(currentBellState).mockReturnValue(null);
    vi.mocked(bellDayStatus).mockReset();
    vi.mocked(bellDayStatus).mockReturnValue('no-plan');
  });

  it('pokazuje minuty, podpis i następną lekcję w trakcie lekcji / shows the minutes, the caption and the next lesson during a lesson', () => {
    vi.mocked(currentBellState).mockReturnValue(LESSON);
    vi.mocked(bellDayStatus).mockReturnValue('during');

    const html = renderHero();

    expect(html).toContain('>12<');
    expect(html).toContain('>min<');
    expect(html).toContain('do dzwonka');
    expect(html).toContain('Następna: lekcja 3 o 9:50');
    expect(html).toContain('href="/bell"');
    expect(html).not.toContain('Brak planu dzwonków');
  });

  it('w przerwie pokazuje „Przerwa, do lekcji N” / during a break shows "Przerwa, do lekcji N"', () => {
    vi.mocked(currentBellState).mockReturnValue(BREAK);
    vi.mocked(bellDayStatus).mockReturnValue('during');

    const html = renderHero();

    expect(html).toContain('>5<');
    expect(html).toContain('Przerwa, do lekcji 3');
    expect(html).not.toContain('Następna: lekcja');
  });

  it('bez planu pokazuje „Brak planu dzwonków” bez dużej liczby / without a plan shows "Brak planu dzwonków" with no big number', () => {
    vi.mocked(bellDayStatus).mockReturnValue('no-plan');

    const html = renderHero();

    expect(html).toContain('Brak planu dzwonków');
    expect(html).not.toContain('>min<');
    expect(html).not.toContain('–');
  });

  it('w dzień wolny pokazuje „Dziś nie ma lekcji” / on a day off shows "Dziś nie ma lekcji"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('day-off');

    const html = renderHero();

    expect(html).toContain('Dziś nie ma lekcji');
    expect(html).not.toContain('>min<');
  });

  it('przed lekcjami pokazuje „Lekcje jeszcze się nie zaczęły” / before the lessons shows "Lekcje jeszcze się nie zaczęły"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('before');

    const html = renderHero();

    expect(html).toContain('Lekcje jeszcze się nie zaczęły');
    expect(html).not.toContain('>min<');
  });

  it('w trakcie bez stanu licznika pokazuje „Trwa lekcja” / during the lessons without a countdown state shows "Trwa lekcja"', () => {
    vi.mocked(bellDayStatus).mockReturnValue('during');

    const html = renderHero();

    expect(html).toContain('Trwa lekcja');
    expect(html).not.toContain('>min<');
  });

  it('po lekcjach pokazuje „Po lekcjach” / after the lessons shows "Po lekcjach"', () => {
    vi.setSystemTime(new Date('2026-10-23T17:00:00Z'));
    vi.mocked(bellDayStatus).mockReturnValue('after');

    const html = renderHero();

    expect(html).toContain('Po lekcjach');
    expect(html).not.toContain('>min<');
  });
});

describe('DashboardHero: blok „Ważne”', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pokazuje tytuł i źródło, a link prowadzi do wpisu / shows the title and the source, and the link leads to the entry', () => {
    const html = renderHero(IMPORTANT);

    expect(html).toContain('Zebranie rodziców');
    expect(html).toContain('Ważne · Sekretariat');
    expect(html).toContain('We wtorek o 17:00 w auli.');
    expect(html).toContain('href="/news/feed/n-7"');
  });

  it('bez wpisu nie pokazuje bloku / without an entry shows no block', () => {
    const html = renderHero(null);

    expect(html).not.toContain('Ważne');
    expect(html).not.toContain('/news/feed/');
  });

  it('bez treści nie pokazuje fragmentu / without content shows no excerpt', () => {
    const html = renderHero({ ...IMPORTANT, excerpt: '' });

    expect(html).toContain('Zebranie rodziców');
    expect(html).not.toContain('We wtorek');
  });
});
