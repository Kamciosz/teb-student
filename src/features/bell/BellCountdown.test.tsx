/**
 * PL: Testy komponentu licznika: bez planu nic nie rysuje, z przykładowym planem pokazuje minuty i etykietę w czasie lekcji i przerwy, a w dniu skróconym liczy według skróconego planu. Plany PRZYKŁADOWE w tym pliku nie są planem szkoły.
 * EN: Tests of the countdown component: with no plan it draws nothing, with the EXAMPLE plan it shows the minutes and the label during a lesson and a break, and on a shortened day it counts from the shortened plan. The EXAMPLE plans in this file are not the school's plan.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses src/features/bell/BellCountdown.tsx::BellCountdown
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest i sterowanie czasem systemowym.
// EN: Vitest test functions and control of the system clock.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// PL: Renderowanie komponentu do HTML bez przeglądarki.
// EN: Rendering the component to HTML without a browser.
import { renderToString } from 'react-dom/server';
import { BellCountdown } from './BellCountdown';
import type { Lesson } from './bellPlan';

// PL: Przykładowe plany podstawiane za moduł bellPlan. Pola są czytane przy każdym dostępie, więc test może zmienić plan.
// EN: EXAMPLE plans swapped in for the bellPlan module. The fields are read on every access, so a test can change the plan.
const plan = vi.hoisted(() => ({
  regular: [] as Lesson[],
  shortened: [] as Lesson[],
}));

vi.mock('./bellPlan', () => ({
  get BELL_PLAN() {
    return plan.regular;
  },
  get SHORTENED_BELL_PLAN() {
    return plan.shortened;
  },
}));

// PL: PRZYKŁAD zwykłego planu (nie prawdziwy plan szkoły).
// EN: EXAMPLE regular plan (not the school's real plan).
const EXAMPLE_PLAN: readonly Lesson[] = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
];

// PL: PRZYKŁAD skróconego planu: krótsze lekcje, inne godziny niż zwykły.
// EN: EXAMPLE shortened plan: shorter lessons, other times than the regular one.
const EXAMPLE_SHORTENED_PLAN: readonly Lesson[] = [
  { start: '08:00', end: '08:30' },
  { start: '08:40', end: '09:10' },
];

// PL: Dzień przykładu w formacie RRRR-MM-DD (23.10.2026, piątek).
// EN: The example day as YYYY-MM-DD (23.10.2026, a Friday).
const SHORTENED_DAY = '2026-10-23';

beforeEach(() => {
  // PL: Sterowany zegar, żeby wynik nie zależał od dnia uruchomienia testu.
  // EN: A controlled clock, so the result does not depend on the day the test runs.
  vi.useFakeTimers();
  plan.regular = [...EXAMPLE_PLAN];
  plan.shortened = [...EXAMPLE_SHORTENED_PLAN];
});

afterEach(() => {
  vi.useRealTimers();
});

describe('BellCountdown', () => {
  it('bez planu nic nie rysuje', () => {
    // PL: 23.10.2026 09:10 w Warszawie: w porze lekcji, ale planu nie ma.
    // EN: 23.10.2026 09:10 in Warsaw: lesson time, but there is no plan.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    plan.regular = [];
    expect(renderToString(<BellCountdown />)).toBe('');
  });

  it('w czasie lekcji pokazuje minuty do dzwonka', () => {
    // PL: 09:10 w Warszawie to druga lekcja z przykładu: 30 minut do dzwonka.
    // EN: 09:10 in Warsaw is the second lesson of the example: 30 minutes to the bell.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    const html = renderToString(<BellCountdown />);
    expect(html).toContain('30');
    expect(html).toContain('min');
    expect(html).toContain('do dzwonka');
  });

  it('w czasie lekcji pokazuje następną lekcję z godziną', () => {
    // PL: 08:10 w Warszawie to pierwsza lekcja z przykładu; następna jest lekcja 2 o 8:55 (bez zera z przodu).
    // EN: 08:10 in Warsaw is the first example lesson; the next one is lesson 2 at 8:55 (no leading zero).
    vi.setSystemTime(new Date('2026-10-23T06:10:00Z'));
    const html = renderToString(<BellCountdown />);
    expect(html).toContain('Następna: lekcja 2 o 8:55');
  });

  it('w ostatniej lekcji dnia nie pokazuje następnej lekcji', () => {
    // PL: 09:10 w Warszawie to ostatnia lekcja przykładu: po niej nie ma następnej, więc tekstu „Następna” nie ma.
    // EN: 09:10 in Warsaw is the last example lesson: nothing follows it, so there is no "Następna" text.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    const html = renderToString(<BellCountdown />);
    expect(html).toContain('do dzwonka');
    expect(html).not.toContain('Następna');
  });

  it('w przerwie pokazuje minuty do lekcji', () => {
    // PL: 08:50 w Warszawie to przerwa między lekcjami z przykładu: 5 minut do następnej, czyli do lekcji 2.
    // EN: 08:50 in Warsaw is the break between the example lessons: 5 minutes to the next one, that is lesson 2.
    vi.setSystemTime(new Date('2026-10-23T06:50:00Z'));
    const html = renderToString(<BellCountdown />);
    expect(html).toContain('>5<');
    expect(html).toContain('Przerwa, do lekcji 2');
  });

  it('w weekend nic nie rysuje', () => {
    // PL: Sobota 24.10.2026 09:10 w Warszawie.
    // EN: Saturday 24.10.2026 09:10 in Warsaw.
    vi.setSystemTime(new Date('2026-10-24T07:10:00Z'));
    expect(renderToString(<BellCountdown />)).toBe('');
  });

  it('w dniu skróconym liczy według skróconego planu', () => {
    // PL: 08:10 w Warszawie w dniu skróconym: lekcja 1 kończy się o 8:30, czyli 20 minut; następna jest lekcja 2 o 8:40 (w zwykłym planie byłoby 50 minut i 8:55).
    // EN: 08:10 in Warsaw on a shortened day: lesson 1 ends at 8:30, so 20 minutes; the next one is lesson 2 at 8:40 (the regular plan would give 50 minutes and 8:55).
    vi.setSystemTime(new Date('2026-10-23T06:10:00Z'));
    const html = renderToString(<BellCountdown shortenedDays={new Set([SHORTENED_DAY])} />);
    expect(html).toContain('>20<');
    expect(html).toContain('Następna: lekcja 2 o 8:40');
  });

  it('w dniu skróconym przerwa jest z krótszego planu', () => {
    // PL: 08:35 w Warszawie w dniu skróconym to przerwa (lekcja 1 skończyła się o 8:30); w zwykłym planie to jeszcze lekcja.
    // EN: 08:35 in Warsaw on a shortened day is a break (lesson 1 ended at 8:30); in the regular plan it is still a lesson.
    vi.setSystemTime(new Date('2026-10-23T06:35:00Z'));
    const html = renderToString(<BellCountdown shortenedDays={new Set([SHORTENED_DAY])} />);
    expect(html).toContain('>5<');
    expect(html).toContain('Przerwa, do lekcji 2');
    // PL: Sprawdzamy cały tekst etykiety, bo aria-label „Licznik do dzwonka” też zawiera te słowa.
    // EN: We check the whole label text, because the aria-label "Licznik do dzwonka" also contains these words.
    expect(html).not.toContain('>do dzwonka<');
  });
});
