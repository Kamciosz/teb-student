/**
 * PL: Ekran główny panelu (6.1b i 6.1c w docs/projekt/EKRANY.md): podpis roli i wiersze części panelu, które widzi ta rola. Samorząd i administrator widzą Wpisy, Zgłoszenia, Ankiety i Kody zaproszeń, redakcja tylko Wpisy z notatką o ograniczeniu.
 * EN: The panel main screen (6.1b and 6.1c in docs/projekt/EKRANY.md): the role caption and the rows of the panel sections this role sees. The Council and the administrator see Entries, Reports, Surveys and Invitation codes, the editorial team only Entries with a note about the limit.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::usePanelLevel
 * @uses src/features/admin/panelView.ts::sectionsFor
 * @uses src/features/admin/panelView.ts::roleCaption
 * @used_by src/features/admin/AdminScreen.tsx::PanelHome
 */

import { Link } from 'react-router';
import { Icon } from './icons';
import { roleCaption, sectionsFor } from './panelView';
import { usePanelLevel } from './queries';
import { ScreenTop } from './ScreenTop';

/**
 * PL: Rysuje ekran główny panelu dla roli zalogowanego ucznia. Rama panelu wpuszcza tu tylko uczniów z rolą, więc bez roli ekran nic nie rysuje.
 * EN: Draws the panel main screen for the signed-in student's role. The panel frame lets only students with a role in here, so without a role the screen draws nothing.
 *
 * @returns PL: drzewo elementów ekranu albo null. EN: the tree of screen elements or null.
 */
export function PanelHome() {
  // PL: Rola z pamięci podręcznej (rama panelu już ją wczytała).
  // EN: The role from the cache (the panel frame has already loaded it).
  const level = usePanelLevel().data;
  if (!level) return null;

  return (
    <main className="ad-screen" data-subtrack="8">
      {/* PL: Redakcja ma „Panel redakcji”, reszta „Panel Samorządu”. EN: The editorial team has "Panel redakcji", the rest "Panel Samorządu". */}
      <ScreenTop title={level === 'editor' ? 'Panel redakcji' : 'Panel Samorządu'} backTo="/profile" backLabel="Wróć do profilu" />
      {/* PL: Podpis roli ucznia. EN: The student's role caption. */}
      <p className="ad-caption">{roleCaption(level)}</p>
      {/* PL: Kafel z wierszami części panelu. Każdy wiersz jest linkiem do ekranu części. EN: The tile with the panel section rows. Each row is a link to the section screen. */}
      <ul className="ad-tile">
        {sectionsFor(level).map((section) => (
          <li key={section.to}>
            <Link className="ad-row" to={section.to}>
              <Icon name={section.icon} />
              <span className="ad-row-text">
                {section.title}
                <small>{section.hint}</small>
              </span>
              <Icon name="chevron-right" />
            </Link>
          </li>
        ))}
      </ul>
      {/* PL: Redakcja widzi notatkę, dlaczego reszty panelu nie ma. EN: The editorial team sees a note on why the rest of the panel is missing. */}
      {level === 'editor' ? (
        <p className="ad-note">
          <Icon name="lock" />
          Redakcja publikuje tylko wpisy. Resztę panelu widzi Samorząd.
        </p>
      ) : null}
    </main>
  );
}
