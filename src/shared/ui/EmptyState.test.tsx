/**
 * PL: Test pustego stanu: tytuł w znaczniku i treść dodatkowa tylko wtedy, gdy jest podana. Pusty stan nie jest sterowny, więc nie ma klawiatury ani stanu wyłączenia. Przycisk podany w treści ma swoje testy w Button.test.tsx.
 * EN: Test of the empty state: the title in the markup and the extra content only when given. The empty state is not a control, so it has no keyboard or disabled state. A button given in the content has its own tests in Button.test.tsx.
 *
 * @author Kacper
 * @since 2026-10-13
 * @uses src/shared/ui/EmptyState.tsx::EmptyState
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent pod testem.
// EN: The component under test.
import { EmptyState } from './EmptyState';

describe('pusty stan / the empty state', () => {
  it('pokazuje tytuł bez dodatkowej treści / shows the title without extra content', () => {
    const html = renderToString(<EmptyState title="Nie ma ankiet" />);

    expect(html).toContain('class="ui-empty"');
    expect(html).toContain('Nie ma ankiet');
    expect(html).not.toContain('ui-empty-body');
  });

  it('dodatkowa treść pojawia się pod tytułem, gdy jest podana / extra content appears below the title when given', () => {
    const html = renderToString(
      <EmptyState title="Nie ma zgłoszeń">
        <a href="/reports/student">Zgłoś problem</a>
      </EmptyState>,
    );

    expect(html).toContain('ui-empty-body');
    expect(html).toContain('Zgłoś problem');
    expect(html.indexOf('Nie ma zgłoszeń')).toBeLessThan(html.indexOf('ui-empty-body'));
  });
});
