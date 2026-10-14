/**
 * PL: Test czterech kafelków pulpitu i jego górnego rzędu: dane, adresy, do których prowadzą, i pusty stan każdego kafelka z napisem zamiast zniknięcia.
 * EN: Test of the four dashboard tiles and its top row: the data, the addresses they lead to, and the empty state of every tile with a label instead of disappearing.
 *
 * @author Kacper
 * @since 2026-10-11
 * @uses src/features/dashboard/ImportantTile.tsx::ImportantTile
 * @uses src/features/dashboard/SurveyTile.tsx::SurveyTile
 * @uses src/features/dashboard/ReportTile.tsx::ReportTile
 * @uses src/features/dashboard/AnnouncementsTile.tsx::AnnouncementsTile
 * @uses src/features/dashboard/DashboardHeader.tsx::DashboardHeader
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Rysowanie do tekstu HTML, a router do linków w kafelkach.
// EN: Rendering to an HTML string, and the router for the links in the tiles.
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Kafelki i górny rząd pod testem.
// EN: The tiles and the top row under test.
import { AnnouncementsTile } from './AnnouncementsTile';
import { DashboardHeader } from './DashboardHeader';
import { ImportantTile } from './ImportantTile';
import { ReportTile } from './ReportTile';
import { SurveyTile } from './SurveyTile';

/**
 * PL: Rysuje element w routerze w pamięci i oddaje HTML.
 * EN: Renders an element inside an in-memory router and returns the HTML.
 *
 * @param element - PL: element do narysowania. EN: the element to render.
 * @returns PL: tekst HTML. EN: the HTML string.
 */
function html(element: ReactElement): string {
  return renderToString(<MemoryRouter>{element}</MemoryRouter>);
}

// PL: Grupa testów kafla „Ważne”.
// EN: A group of tests of the "Ważne" tile.
describe('ImportantTile', () => {
  // PL: Kafel pokazuje źródło, tytuł i fragment treści, a cały prowadzi do wpisu.
  // EN: The tile shows the source, title and excerpt, and the whole tile leads to the entry.
  it('pokazuje wpis i prowadzi do niego / shows the entry and leads to it', () => {
    const entry = { id: 'w 1', title: 'Jutro 3TA zaczyna o 9:50', excerpt: 'Dwie pierwsze lekcje przeniesione na piątek.', source: 'Sekretariat', publishedAt: new Date().toISOString() };

    const result = html(<ImportantTile entry={entry} />);

    expect(result).toContain('Ważne · Sekretariat');
    expect(result).toContain('Jutro 3TA zaczyna o 9:50');
    expect(result).toContain('Dwie pierwsze lekcje przeniesione na piątek.');
    expect(result).toContain('href="/news/feed/w%201"');
  });

  // PL: Bez wpisu kafel nie znika, tylko mówi, że nic nie ma, i nie ma linku.
  // EN: Without an entry the tile does not disappear, it says there is nothing, and has no link.
  it('bez wpisu mówi, że nic nie ma / without an entry says there is nothing', () => {
    const result = html(<ImportantTile entry={null} />);

    expect(result).toContain('Ważne');
    expect(result).toContain('Nie ma jeszcze wpisów.');
    expect(result).not.toContain('href=');
  });
});

// PL: Grupa testów kafla „Ankieta”.
// EN: A group of tests of the "Ankieta" tile.
describe('SurveyTile', () => {
  // PL: Kafel pokazuje dni do końca, tytuł i przycisk „Wypełnij” z adresem ankiety.
  // EN: The tile shows the days left, the title and the "Wypełnij" button with the survey address.
  it('pokazuje dni do końca i prowadzi do ankiety / shows the days left and leads to the survey', () => {
    const result = html(<SurveyTile survey={{ id: 'dodatkowe', title: 'Zajęcia dodatkowe w II semestrze', daysLeft: 3 }} />);

    expect(result).toContain('>3<');
    expect(result).toContain('dni do końca');
    expect(result).toContain('Zajęcia dodatkowe w II semestrze');
    expect(result).toContain('href="/surveys/vote/dodatkowe"');
    expect(result).toContain('Wypełnij');
  });

  // PL: Bez ankiety kafel mówi, że nie ma czego wypełniać, i nie ma przycisku.
  // EN: Without a survey the tile says there is nothing to fill in, and has no button.
  it('bez ankiety mówi, że nic nie ma / without a survey says there is nothing', () => {
    const result = html(<SurveyTile survey={null} />);

    expect(result).toContain('Nie ma ankiet do wypełnienia.');
    expect(result).not.toContain('Wypełnij');
  });
});

// PL: Grupa testów kafla „Zgłoszenia”.
// EN: A group of tests of the "Zgłoszenia" tile.
describe('ReportTile', () => {
  // PL: Kafel pokazuje liczbę w trakcie, treść, podpis etapu, zapalone dwa z trzech segmentów i prowadzi do „Moich zgłoszeń”.
  // EN: The tile shows the in-progress count, the text, the stage caption, two of three segments lit and leads to "Moje zgłoszenia".
  it('pokazuje etap zgłoszenia i prowadzi do „Moich zgłoszeń” / shows the report stage and leads to "Moje zgłoszenia"', () => {
    const result = html(<ReportTile report={{ description: 'Nie działa projektor w sali 204', stage: 2, openCount: 1 }} />);

    expect(result).toContain('Nie działa projektor w sali 204');
    expect(result).toContain('Etap 2 z 3');
    expect(result).toContain('w trakcie');
    expect(result.match(/dash-stages__on/g)).toHaveLength(2);
    expect(result).toContain('href="/reports/student/moje"');
  });

  // PL: Bez zgłoszeń kafel mówi, że ich nie ma, i nie ma linku.
  // EN: Without reports the tile says there are none, and has no link.
  it('bez zgłoszeń mówi, że nic nie ma / without reports says there is nothing', () => {
    const result = html(<ReportTile report={null} />);

    expect(result).toContain('Nie masz jeszcze żadnych zgłoszeń.');
    expect(result).not.toContain('href=');
  });
});

// PL: Grupa testów kafla „Ogłoszenia”.
// EN: A group of tests of the "Ogłoszenia" tile.
describe('AnnouncementsTile', () => {
  // PL: Każdy wiersz ma datę, tytuł i adres wpisu, a nagłówek prowadzi do listy aktualności.
  // EN: Every row has a date, a title and the entry address, and the heading leads to the news list.
  it('pokazuje wiersze z datą i prowadzi do wpisów / shows rows with a date and leads to the entries', () => {
    const rows = [
      { id: 'a', title: 'Biblioteka: nowe godziny otwarcia', publishedAt: '2026-10-12T08:00:00Z' },
      { id: 'b', title: 'Próbny egzamin zawodowy INF.04', publishedAt: '2026-10-22T08:00:00Z' },
    ];

    const result = html(<AnnouncementsTile rows={rows} />);

    expect(result).toContain('12.10');
    expect(result).toContain('Próbny egzamin zawodowy INF.04');
    expect(result).toContain('href="/news/feed/a"');
    expect(result).toContain('href="/news/feed/b"');
    expect(result).toContain('href="/news/feed"');
    expect(result).not.toContain('Nie ma jeszcze wpisów.');
  });

  // PL: Bez wpisów kafel mówi, że ich nie ma, a nagłówek dalej prowadzi do aktualności.
  // EN: Without entries the tile says there are none, and the heading still leads to the news.
  it('bez wpisów mówi, że nic nie ma / without entries says there is nothing', () => {
    const result = html(<AnnouncementsTile rows={[]} />);

    expect(result).toContain('Ogłoszenia');
    expect(result).toContain('Nie ma jeszcze wpisów.');
  });
});

// PL: Test górnego rzędu.
// EN: The top row test.
describe('DashboardHeader', () => {
  // PL: Czas przypięty do wtorku roboczego, bo w weekend pusty plan dałby „Dziś nie ma lekcji”, a test czeka na „Brak planu dzwonków”.
  // EN: The time is pinned to a working Tuesday, because on a weekend an empty plan would give "Dziś nie ma lekcji", and the test expects "Brak planu dzwonków".
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-13T09:10:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // PL: O 11:10 w Warszawie trwa lekcja 4 (10:40–11:25 w planie szkoły), więc licznik pokazuje 15 minut i prowadzi do ekranu /bell.
  // EN: At 11:10 in Warsaw lesson 4 is on (10:40–11:25 in the school plan), so the countdown shows 15 minutes and leads to the /bell screen.
  it('ma powitanie i licznik minut, który prowadzi do dzwonka / has the greeting and the minute countdown that leads to the bell', () => {
    const result = html(<DashboardHeader editing={false} onToggleEdit={() => {}} />);

    expect(result).toContain('Cześć');
    expect(result).toContain('<p class="dash-bell__num">15</p>');
    expect(result).not.toContain('Brak planu dzwonków');
    expect(result).toContain('href="/bell"');
  });

  // PL: Przycisk układu pokazuje „Zmień układ” poza trybem edycji i „Gotowe” w trybie edycji.
  // EN: The layout button shows "Zmień układ" outside the edit mode and "Gotowe" in the edit mode.
  it('przycisk układu zmienia napis / the layout button changes its label', () => {
    expect(html(<DashboardHeader editing={false} onToggleEdit={() => {}} />)).toContain('Zmień układ');
    expect(html(<DashboardHeader editing onToggleEdit={() => {}} />)).toContain('Gotowe');
  });
});
