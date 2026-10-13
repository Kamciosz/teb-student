/**
 * PL: Testy komponentu licznika: bez planu nic nie rysuje, z przykładowym planem pokazuje minuty i etykietę w czasie lekcji i przerwy. Plan PRZYKŁADOWY w tym pliku nie jest planem szkoły.
 * EN: Tests of the countdown component: with no plan it draws nothing, with the EXAMPLE plan it shows the minutes and the label during a lesson and a break. The EXAMPLE plan in this file is not the school's plan.
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

// PL: PRZYKŁAD planu do testów (nie prawdziwy plan szkoły).
// EN: EXAMPLE plan for the tests (not the school's real plan).
const EXAMPLE_PLAN: readonly Lesson[] = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
];

beforeEach(() => {
  // PL: Sterowany zegar, żeby wynik nie zależał od dnia uruchomienia testu.
  // EN: A controlled clock, so the result does not depend on the day the test runs.
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('BellCountdown', () => {
  it('bez planu nic nie rysuje', () => {
    // PL: 23.10.2026 09:10 w Warszawie: w porze lekcji, ale planu nie ma.
    // EN: 23.10.2026 09:10 in Warsaw: lesson time, but there is no plan.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    expect(renderToString(<BellCountdown />)).toBe('');
  });

  it('w czasie lekcji pokazuje minuty do dzwonka', () => {
    // PL: 09:10 w Warszawie to druga lekcja z przykładu: 30 minut do dzwonka.
    // EN: 09:10 in Warsaw is the second lesson of the example: 30 minutes to the bell.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    const html = renderToString(<BellCountdown lessons={EXAMPLE_PLAN} />);
    expect(html).toContain('30');
    expect(html).toContain('min');
    expect(html).toContain('do dzwonka');
  });

  it('w czasie lekcji pokazuje następną lekcję z godziną', () => {
    // PL: 08:10 w Warszawie to pierwsza lekcja z przykładu; następna jest lekcja 2 o 8:55 (bez zera z przodu).
    // EN: 08:10 in Warsaw is the first example lesson; the next one is lesson 2 at 8:55 (no leading zero).
    vi.setSystemTime(new Date('2026-10-23T06:10:00Z'));
    const html = renderToString(<BellCountdown lessons={EXAMPLE_PLAN} />);
    expect(html).toContain('Następna: lekcja 2 o 8:55');
  });

  it('w ostatniej lekcji dnia nie pokazuje następnej lekcji', () => {
    // PL: 09:10 w Warszawie to ostatnia lekcja przykładu: po niej nie ma następnej, więc tekstu „Następna” nie ma.
    // EN: 09:10 in Warsaw is the last example lesson: nothing follows it, so there is no "Następna" text.
    vi.setSystemTime(new Date('2026-10-23T07:10:00Z'));
    const html = renderToString(<BellCountdown lessons={EXAMPLE_PLAN} />);
    expect(html).toContain('do dzwonka');
    expect(html).not.toContain('Następna');
  });

  it('w przerwie pokazuje minuty do lekcji', () => {
    // PL: 08:50 w Warszawie to przerwa między lekcjami z przykładu: 5 minut do następnej, czyli do lekcji 2.
    // EN: 08:50 in Warsaw is the break between the example lessons: 5 minutes to the next one, that is lesson 2.
    vi.setSystemTime(new Date('2026-10-23T06:50:00Z'));
    const html = renderToString(<BellCountdown lessons={EXAMPLE_PLAN} />);
    expect(html).toContain('>5<');
    expect(html).toContain('Przerwa, do lekcji 2');
  });

  it('w weekend nic nie rysuje', () => {
    // PL: Sobota 24.10.2026 09:10 w Warszawie.
    // EN: Saturday 24.10.2026 09:10 in Warsaw.
    vi.setSystemTime(new Date('2026-10-24T07:10:00Z'));
    expect(renderToString(<BellCountdown lessons={EXAMPLE_PLAN} />)).toBe('');
  });
});
