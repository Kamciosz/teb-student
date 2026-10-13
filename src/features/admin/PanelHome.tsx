/**
 * PL: Ekran główny panelu (6.1b i 6.1c w docs/projekt/EKRANY.md): podpis roli i wiersze części panelu, które widzi ta rola. Samorząd widzi Wpisy, Zgłoszenia, Ankiety i Kody zaproszeń, administrator to samo plus „Role” ze znacznikiem i osobny kafel „Pilotaż”, redakcja tylko Wpisy z notatką o ograniczeniu.
 * EN: The panel main screen (6.1b and 6.1c in docs/projekt/EKRANY.md): the role caption and the rows of the panel sections this role sees. The Council sees Entries, Reports, Surveys and Invitation codes, the administrator the same plus "Role" with a badge and a separate "Pilotaż" tile, the editorial team only Entries with a note about the limit.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/admin/queries.ts::usePanelLevel
 * @uses src/features/admin/panelView.ts::sectionsFor
 * @uses src/features/admin/panelView.ts::pilotSectionsFor
 * @uses src/features/admin/panelView.ts::roleCaption
 * @used_by src/features/admin/AdminScreen.tsx::PanelHome
 */

import { Link } from 'react-router';
import { Icon } from './icons';
import { type PanelSection, pilotSectionsFor, roleCaption, sectionsFor } from './panelView';
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

  const pilot = pilotSectionsFor(level);
  return (
    <main className="ad-screen" data-subtrack="8">
      {/* PL: Redakcja ma „Panel redakcji”, reszta „Panel Samorządu”. EN: The editorial team has "Panel redakcji", the rest "Panel Samorządu". */}
      <ScreenTop title={level === 'editor' ? 'Panel redakcji' : 'Panel Samorządu'} backTo="/profile" backLabel="Wróć do profilu" />
      {/* PL: Podpis roli ucznia. EN: The student's role caption. */}
      <p className="ad-caption">{roleCaption(level)}</p>
      {/* PL: Kafel z wierszami części panelu. EN: The tile with the panel section rows. */}
      <SectionTile sections={sectionsFor(level)} />
      {/* PL: Administrator widzi pod etykietą „Pilotaż” osobny kafel. EN: The administrator sees a separate tile under the "Pilotaż" label. */}
      {pilot.length > 0 ? (
        <>
          <span className="ad-label ad-label-below">Pilotaż</span>
          <SectionTile sections={pilot} />
        </>
      ) : null}
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

/**
 * PL: Rysuje kafel z wierszami części panelu. Każdy wiersz jest linkiem do ekranu części, a znacznik (jeśli jest) stoi przy tytule.
 * EN: Draws a tile with the panel section rows. Each row is a link to the section screen, and the badge (if there is one) stands next to the title.
 *
 * @param props - PL: części do pokazania. EN: the sections to show.
 * @returns PL: lista wierszy. EN: the list of rows.
 */
function SectionTile({ sections }: { sections: PanelSection[] }) {
  return (
    <ul className="ad-tile">
      {sections.map((section) => (
        <li key={section.to}>
          <Link className="ad-row" to={section.to}>
            <Icon name={section.icon} />
            <span className="ad-row-text">
              <span className="ad-row-title">
                {section.title}
                {section.badge ? <span className="ad-badge">{section.badge}</span> : null}
              </span>
              <small>{section.hint}</small>
            </span>
            <Icon name="chevron-right" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
