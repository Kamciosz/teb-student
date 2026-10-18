/**
 * PL: Testy sekcji „Do zrobienia”: ankieta z terminem jako wartością (akcent, gdy termin jest dziś), zgłoszenie z nazwą etapu, bez zgłoszenia i ankiety sekcja w ogóle się nie pojawia.
 * EN: Tests of the "Do zrobienia" section: a survey with the deadline as the value (accent when the deadline is today), a report with the stage name, and with neither a survey nor a report the section does not appear at all.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-18
 * @uses src/features/dashboard/TodoSection.tsx::TodoSection
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Renderowanie na tekst i router, którego wymagają linki wierszy.
// EN: Rendering to text and the router that the row links need.
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
// PL: Testowana sekcja i typy danych.
// EN: The tested section and the data types.
import { TodoSection } from './TodoSection';
import type { DashboardReport, DashboardSurvey } from './types';

// PL: Przykładowa ankieta z terminem za trzy dni.
// EN: A sample survey with the deadline in three days.
const SURVEY: DashboardSurvey = { id: 'a-1', title: 'Ankieta o stołówce', daysLeft: 3 };

// PL: Przykładowe zgłoszenie w etapie „W trakcie”.
// EN: A sample report at the "W trakcie" stage.
const REPORT: DashboardReport = { description: 'Zepsuty rzutnik', stage: 2, openCount: 1 };

/**
 * PL: Renderuje sekcję w routerze.
 * EN: Renders the section inside a router.
 *
 * @param survey - PL: ankieta albo null. EN: the survey or null.
 * @param report - PL: zgłoszenie albo null. EN: the report or null.
 * @returns PL: HTML sekcji. EN: the HTML of the section.
 */
function renderTodo(survey: DashboardSurvey | null, report: DashboardReport | null): string {
  return renderToString(
    <MemoryRouter>
      <TodoSection survey={survey} report={report} />
    </MemoryRouter>,
  );
}

describe('TodoSection', () => {
  // PL: Bez ankiety i zgłoszenia nie ma ani nagłówka, ani wierszy.
  // EN: Without a survey and a report there is neither a header nor rows.
  it('bez ankiety i zgłoszenia nic nie pokazuje / with neither a survey nor a report shows nothing', () => {
    expect(renderTodo(null, null)).toBe('');
  });

  // PL: Nagłówek i wiersz ankiety z terminem i linkiem do głosowania.
  // EN: The header and the survey row with the deadline and the link to voting.
  it('pokazuje ankietę z terminem i linkiem / shows the survey with the deadline and the link', () => {
    const html = renderTodo(SURVEY, null);

    expect(html).toContain('Do zrobienia');
    expect(html).toContain('Ankieta o stołówce');
    expect(html).toContain('jeszcze 3 dni');
    expect(html).toContain('href="/surveys/vote/a-1"');
    expect(html).not.toContain('dash-accent');
  });

  // PL: Termin dziś dostaje akcent marki.
  // EN: A deadline today gets the brand accent.
  it('termin dziś ma akcent / a deadline today has the accent', () => {
    const html = renderTodo({ ...SURVEY, daysLeft: 0 }, null);

    expect(html).toContain('<span class="dash-accent">dziś</span>');
  });

  // PL: Zgłoszenie pokazuje etap jako wartość i prowadzi do listy zgłoszeń ucznia.
  // EN: The report shows the stage as the value and leads to the student's report list.
  it('pokazuje zgłoszenie z etapem / shows the report with the stage', () => {
    const html = renderTodo(null, REPORT);

    expect(html).toContain('Zepsuty rzutnik');
    expect(html).toContain('W trakcie');
    expect(html).toContain('href="/reports/student/moje"');
  });

  // PL: Ankieta i zgłoszenie stoją w jednej grupie, ankieta pierwsza.
  // EN: The survey and the report sit in one group, the survey first.
  it('ankieta jest przed zgłoszeniem / the survey comes before the report', () => {
    const html = renderTodo(SURVEY, REPORT);

    expect(html.indexOf('Ankieta o stołówce')).toBeLessThan(html.indexOf('Zepsuty rzutnik'));
  });
});
