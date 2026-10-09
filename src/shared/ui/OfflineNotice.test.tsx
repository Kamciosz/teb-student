/**
 * PL: Test napisu o braku internetu: tekst „Brak internetu”, informacja od kiedy dane są stare i napis bez niej, gdy nic nie pobrano. Napis jest rysowany do tekstu (react-dom/server), bo testy działają w Workerze bez przeglądarki.
 * EN: Test of the no-internet label: the "Brak internetu" text, the since-when information and the label without it when nothing was fetched. The label is rendered to a string (react-dom/server), because the tests run in a Worker without a browser.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/ui/OfflineNotice.tsx::OfflineNotice
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent i funkcja pod testem.
// EN: The component and function under test.
import { OfflineNotice, formatStaleSince } from './OfflineNotice';

describe('napis o braku internetu / the no-internet label', () => {
  it('formatuje chwilę w czasie telefonu / formats the moment in the phone time', () => {
    expect(formatStaleSince(new Date(2026, 9, 9, 14, 5).getTime())).toBe('9.10, 14:05');
  });

  it('pokazuje „Brak internetu” i od kiedy dane są stare / shows "Brak internetu" and since when the data is stale', () => {
    const html = renderToString(<OfflineNotice staleSince={new Date(2026, 9, 9, 14, 5).getTime()} />);

    expect(html).toContain('Brak internetu');
    expect(html).toContain('Dane z 9.10, 14:05.');
    expect(html).toContain('role="status"');
  });

  it('bez pobranych danych pokazuje sam napis / without fetched data shows the label alone', () => {
    const html = renderToString(<OfflineNotice staleSince={null} />);

    expect(html).toContain('Brak internetu');
    expect(html).not.toContain('Dane z');
  });
});
